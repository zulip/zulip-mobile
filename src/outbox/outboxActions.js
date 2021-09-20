/* @flow strict-local */
// $FlowFixMe[untyped-import]
import parseMarkdown from 'zulip-markdown-parser';
import invariant from 'invariant';

import * as logging from '../utils/logging';
import type {
  GlobalState,
  Narrow,
  Outbox,
  PmOutbox,
  StreamOutbox,
  Stream,
  UserOrBot,
  UserId,
  Action,
  ThunkAction,
} from '../types';
import type { SubsetProperties } from '../generics';
import {
  MESSAGE_SEND_START,
  TOGGLE_OUTBOX_SENDING,
  DELETE_OUTBOX_MESSAGE,
  MESSAGE_SEND_COMPLETE,
} from '../actionConstants';
import { getAuth, getStreamsByName } from '../selectors';
import * as api from '../api';
import { getAllUsersById, getOwnUser } from '../users/userSelectors';
import { getUsersAndWildcards } from '../users/userHelpers';
import { caseNarrowPartial, isConversationNarrow } from '../utils/narrow';
import { BackoffMachine } from '../utils/async';
import { recipientsOfPrivateMessage, streamNameOfStreamMessage } from '../utils/recipient';

export const messageSendStart = (outbox: Outbox): Action => ({
  type: MESSAGE_SEND_START,
  outbox,
});

export const toggleOutboxSending = (sending: boolean): Action => ({
  type: TOGGLE_OUTBOX_SENDING,
  sending,
});

export const deleteOutboxMessage = (localMessageId: number): Action => ({
  type: DELETE_OUTBOX_MESSAGE,
  local_message_id: localMessageId,
});

export const messageSendComplete = (localMessageId: number): Action => ({
  type: MESSAGE_SEND_COMPLETE,
  local_message_id: localMessageId,
});

const trySendMessages = (dispatch, getState): boolean => {
  const state = getState();
  const auth = getAuth(state);
  const outboxToSend = state.outbox.filter(outbox => !outbox.isSent);
  const oneWeekAgoTimestamp = Date.now() / 1000 - 60 * 60 * 24 * 7;
  try {
    outboxToSend.forEach(async item => {
      // If a message has spent over a week in the outbox, it's probably too
      // stale to try sending it.
      //
      // TODO: instead of just throwing these away, create an "unsendable" state
      // (including a reason for unsendability), and transition old messages to
      // that instead.
      if (item.timestamp < oneWeekAgoTimestamp) {
        dispatch(deleteOutboxMessage(item.id));
        return; // i.e., continue
      }

      // prettier-ignore
      const to =
        item.type === 'private'
            // TODO(server-2.0): switch to numeric user IDs, not emails.
          ? recipientsOfPrivateMessage(item).map(r => r.email).join(',')
            // TODO(server-2.0): switch to numeric stream IDs, not names.
            //   (This will require wiring the stream ID through to here.)
            // HACK: the server attempts to interpret this argument as JSON, then
            //   CSV, then a literal. To avoid misparsing, always use JSON.
          : JSON.stringify([streamNameOfStreamMessage(item)]);

      await api.sendMessage(auth, {
        type: item.type,
        to,
        subject: item.subject,
        content: item.markdownContent,
        localId: item.timestamp,
        eventQueueId: state.session.eventQueueId,
      });
      dispatch(messageSendComplete(item.timestamp));
    });
    return true;
  } catch (e) {
    logging.warn(e);
    return false;
  }
};

export const sendOutbox = (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  const state = getState();
  if (state.outbox.length === 0 || state.session.outboxSending) {
    return;
  }
  dispatch(toggleOutboxSending(true));
  const backoffMachine = new BackoffMachine();
  while (!trySendMessages(dispatch, getState)) {
    await backoffMachine.wait();
  }
  dispatch(toggleOutboxSending(false));
};

// A valid display_recipient with all the thread's users, sorted by ID.
const recipientsFromIds = (ids, allUsersById, ownUser) => {
  const result = ids.map(id => {
    const user = allUsersById.get(id);
    if (!user) {
      throw new Error('outbox: missing user when preparing to send PM');
    }
    return { id, email: user.email, full_name: user.full_name };
  });
  if (!result.some(r => r.id === ownUser.user_id)) {
    result.push({ email: ownUser.email, id: ownUser.user_id, full_name: ownUser.full_name });
  }
  result.sort((r1, r2) => r1.id - r2.id);
  return result;
};

// prettier-ignore
type DataFromNarrow =
  | SubsetProperties<PmOutbox, {| type: mixed, display_recipient: mixed, subject: mixed |}>
  | SubsetProperties<StreamOutbox, {| type: mixed, stream_id: mixed, display_recipient: mixed, subject: mixed |}>;

const outboxPropertiesForNarrow = (
  destinationNarrow: Narrow,
  streamsByName: Map<string, Stream>,
  allUsersById: Map<UserId, UserOrBot>,
  ownUser: UserOrBot,
): DataFromNarrow =>
  caseNarrowPartial(destinationNarrow, {
    pm: ids => ({
      type: 'private',
      display_recipient: recipientsFromIds(ids, allUsersById, ownUser),
      subject: '',
    }),

    topic: (streamName, topic) => {
      const stream = streamsByName.get(streamName);
      invariant(stream, 'narrow must be known stream');
      return {
        type: 'stream',
        stream_id: stream.stream_id,
        display_recipient: stream.name,
        subject: topic,
      };
    },
  });

const getContentPreview = (content: string, state: GlobalState): string => {
  try {
    return parseMarkdown(
      content,
      getUsersAndWildcards(state.users),
      state.streams,
      getAuth(state),
      state.realm.filters,
      state.realm.emoji,
    );
  } catch (e) {
    return content;
  }
};

export const addToOutbox = (
  destinationNarrow: Narrow,
  content: string,
): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  invariant(isConversationNarrow(destinationNarrow), 'destination narrow must be conversation');
  const state = getState();
  const ownUser = getOwnUser(state);

  const localTime = Math.round(new Date().getTime() / 1000);
  dispatch(
    messageSendStart({
      isSent: false,
      ...outboxPropertiesForNarrow(
        destinationNarrow,
        getStreamsByName(state),
        getAllUsersById(state),
        ownUser,
      ),
      markdownContent: content,
      content: getContentPreview(content, state),
      timestamp: localTime,
      id: localTime,
      sender_full_name: ownUser.full_name,
      sender_email: ownUser.email,
      sender_id: ownUser.user_id,
      avatar_url: ownUser.avatar_url,
      isOutbox: true,
      reactions: [],
    }),
  );
  dispatch(sendOutbox());
};
