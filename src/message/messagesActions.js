/* @flow strict-local */
import * as logging from '../utils/logging';
import * as NavigationService from '../nav/NavigationService';
import type { Message, Narrow, ThunkAction } from '../types';
import { getAuth, getRealm, getMessages, getZulipFeatureLevel } from '../selectors';
import { getNearOperandFromLink, getNarrowFromLink } from '../utils/internalLinks';
import { openLinkWithUserPreference } from '../utils/openLink';
import { navigateToChat } from '../nav/navActions';
import { FIRST_UNREAD_ANCHOR } from '../anchor';
import { getStreamsById, getStreamsByName } from '../subscriptions/subscriptionSelectors';
import * as api from '../api';
import { isUrlOnRealm, tryParseUrl } from '../utils/url';
import { getOwnUserId } from '../users/userSelectors';
import {
  isTopicNarrow,
  isStreamNarrow,
  topicNarrow,
  streamIdOfNarrow,
  topicOfNarrow,
  streamNarrow,
  caseNarrowDefault,
} from '../utils/narrow';
import { hasMessageEverBeenInStream, hasMessageEverHadTopic } from './messageSelectors';

/**
 * Navigate to the given narrow.
 */
export const doNarrow =
  (narrow: Narrow, anchor: number = FIRST_UNREAD_ANCHOR): ThunkAction<void> =>
  (dispatch, getState) => {
    // TODO: Use `anchor` to open the message list to a particular message.
    NavigationService.dispatch(navigateToChat(narrow));
  };

/**
 * Find the given message, either locally or on the server.
 *
 * If we have the message locally, avoids any network request.
 *
 * Returns null if we can't find the message -- it doesn't exist, or our
 * user can't see it, or a server request for it failed, or the server was
 * simply too old (FL <120).
 *
 * N.B.: Gives a bad experience when the request takes a long time. We
 * should fix that; see TODOs.
 */
const getSingleMessage =
  (messageId: number): ThunkAction<Promise<Message | null>> =>
  async (dispatch, getState) => {
    const state = getState();
    const messages = getMessages(state);
    let message = messages.get(messageId);
    if (message) {
      return message;
    }

    // TODO: Give feedback when the server round trip takes longer than
    //   expected.
    // TODO: Let the user cancel the request so we don't force a doNarrow
    //   after they've given up on tapping the link, and perhaps forgotten
    //   about it. Like any request, this might take well over a minute to
    //   resolve, or never resolve.
    // TODO: When these are fixed, remove warning in jsdoc.

    const auth = getAuth(state);
    const zulipFeatureLevel = getZulipFeatureLevel(state);
    const allowEditHistory = getRealm(state).allowEditHistory;

    if (zulipFeatureLevel < 120) {
      // TODO(server-5.0): Simplify; simplify jsdoc to match.
      // api.getSingleMessage won't give us the message's stream and
      // topic; see there.
      return null;
    }
    try {
      message = await api.getSingleMessage(
        auth,
        { message_id: messageId },
        zulipFeatureLevel,
        allowEditHistory,
      );
    } catch {
      return null;
    }

    // The FL 120 condition on calling api.getSingleMessage should ensure
    // `message` isn't void.
    // TODO(server-5.0): Simplify away.
    if (!message) {
      logging.error('`message` from api.getSingleMessage unexpectedly falsy');
      return null;
    }
    return message;
  };

/**
 * Adjust a /near/ link as needed to account for message moves.
 *
 * It feels quite broken when a link is clearly meant to get you to a
 * specific message, but tapping it brings you to a narrow where the message
 * *used* to be but isn't anymore because it was moved to a new stream or
 * topic. This was #5306.
 *
 * This action, when it can, recognizes when that's about to happen and
 * instead finds the narrow for the message's current stream/topic.
 *
 * To do so, it obviously needs to know the message's current stream/topic.
 * If those can't be gotten from Redux, we ask the server. If the server
 * can't help us (gives an error), we can't help the user, so we won't
 * follow a move in that case.
 */
const adjustNarrowForMoves =
  (narrow: Narrow, nearOperand: number): ThunkAction<Promise<Narrow>> =>
  async (dispatch, getState) => {
    // Many control-flow paths here simply return the original narrow.
    //
    // We do this when the link is meant to find the specific message
    // identified by nearOperand, and:
    // - nearOperand refers to a message that wasn't moved outside the
    //   narrow specified by the link, or
    // - nearOperand *might* refer to a message that was moved, but we don't
    //   know; we've tried and failed to find out.
    //
    // We also do this to insist on the traditional meaning of "near" before
    // the message-move feature: take the narrow's stream/topic/etc.
    // literally, and open to the message "nearest" the given ID (sent
    // around the same time), even if the message with that ID isn't
    // actually in the narrow [1].
    //
    // User docs on moving messages:
    //   https://zulip.com/help/move-content-to-another-stream
    //   https://zulip.com/help/move-content-to-another-topic
    //
    // [1] Tim points out, at
    //       https://chat.zulip.org/#narrow/stream/101-design/topic/redirects.20from.20near.20links/near/1343095 :
    //     "[…] useful for situations where you might replace an existing
    //     search for `stream: 1/topic: 1/near: 15` with
    //     `stream: 2/topic: 2/near: 15` in order to view what was happening
    //     in another conversation at the same time as an existing
    //     conversation."

    const streamIdOperand =
      isStreamNarrow(narrow) || isTopicNarrow(narrow) ? streamIdOfNarrow(narrow) : null;
    const topicOperand = isTopicNarrow(narrow) ? topicOfNarrow(narrow) : null;

    if (streamIdOperand === null && topicOperand === null) {
      // Message moves only happen by changing the stream and/or topic.
      return narrow;
    }

    const message = await dispatch(getSingleMessage(nearOperand));
    if (!message) {
      // We couldn't find the message.  Hopefully it wasn't moved,
      // if it exists or ever did.
      return narrow;
    }

    if (message.type === 'private') {
      // A PM could never have been moved.
      return narrow;
    }

    if (
      (topicOperand === null || topicOperand === message.subject)
      && (streamIdOperand === null || streamIdOperand === message.stream_id)
    ) {
      // The message is still in the stream and/or topic in the link.
      return narrow;
    }

    if (
      (topicOperand !== null && hasMessageEverHadTopic(message, topicOperand) === false)
      || (streamIdOperand !== null && hasMessageEverBeenInStream(message, streamIdOperand) === false)
    ) {
      // The message was never in the narrow specified by the link. That'd
      // be an odd link to put in a message…anyway, perhaps we're meant to
      // use the traditional meaning of "near"; see large block comment at
      // top of function.
      return narrow;
    }
    // If we couldn't access the edit history in the checks above, assume
    // the message was moved. It's the likeliest explanation why its topic
    // and/or stream don't match the narrow link.

    const { stream_id, subject } = message;

    // Reinterpret the link's narrow with the message's current stream
    // and/or topic.
    return caseNarrowDefault(
      narrow,
      {
        stream: () => streamNarrow(stream_id),
        topic: () => topicNarrow(stream_id, subject),
      },
      () => narrow,
    );
  };

/**
 * Narrow to a /near/ link, possibly after reinterpreting it for a message move.
 *
 * See `adjustNarrowForMoves` for more discussion.
 *
 * N.B.: Gives a bad experience when the request takes a long time. We
 * should fix that; see `getSingleMessage`.
 */
const doNarrowNearLink =
  (narrow: Narrow, nearOperand: number): ThunkAction<Promise<void>> =>
  async (dispatch, getState) => {
    const adjustedNarrow = await dispatch(adjustNarrowForMoves(narrow, nearOperand));
    dispatch(doNarrow(adjustedNarrow, nearOperand));
  };

/**
 * Handle a link tap that isn't an image we want to show in the lightbox.
 */
export const messageLinkPress =
  (href: string): ThunkAction<Promise<void>> =>
  async (dispatch, getState, { getGlobalSettings }) => {
    const state = getState();
    const auth = getAuth(state);
    const streamsById = getStreamsById(state);
    const streamsByName = getStreamsByName(state);
    const ownUserId = getOwnUserId(state);
    const narrow = getNarrowFromLink(href, auth.realm, streamsById, streamsByName, ownUserId);

    const parsedUrl = tryParseUrl(href, auth.realm);
    // TODO: Replace all uses of `href` below with `parsedUrl`.

    // TODO: In some cases getNarrowFromLink successfully parses the link, but
    //   finds it points somewhere we can't see: in particular, to a stream
    //   that's hidden from our user (perhaps doesn't exist.)  For those,
    //   perhaps give an error instead of falling back to opening in browser,
    //   which should be futile.
    if (narrow) {
      // This call is OK: `narrow` is truthy, so isNarrowLink(…) was true.
      const nearOperand = getNearOperandFromLink(href, auth.realm);
      if (nearOperand === null) {
        dispatch(doNarrow(narrow));
        return;
      }

      await dispatch(doNarrowNearLink(narrow, nearOperand));
    } else if (!parsedUrl || !isUrlOnRealm(parsedUrl, auth.realm)) {
      openLinkWithUserPreference(href, getGlobalSettings());
    } else {
      const url =
        (await api.tryGetFileTemporaryUrl(href, auth)) ?? new URL(href, auth.realm).toString();
      openLinkWithUserPreference(url, getGlobalSettings());
    }
  };
