/* @flow strict-local */
// $FlowFixMe[untyped-import]
import omit from 'lodash.omit';
import Immutable from 'immutable';

import type { MessagesState, Message, PerAccountApplicableAction, PerAccountState } from '../types';
import {
  REGISTER_COMPLETE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_SUBMESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
} from '../actionConstants';
import { getNarrowsForMessage, keyFromNarrow } from '../utils/narrow';
import * as logging from '../utils/logging';
import { getStreamsById } from '../selectors';

const initialState: MessagesState = Immutable.Map([]);

const eventNewMessage = (state, action) => {
  const { message, caughtUp } = action;
  const { flags } = message;

  if (!flags) {
    throw new Error('EVENT_NEW_MESSAGE message missing flags');
  }

  // Don't add a message that's already been added. It's probably
  // very rare for a message to have already been added when we
  // get an EVENT_NEW_MESSAGE, and perhaps impossible. (TODO:
  // investigate?)
  if (state.get(action.message.id)) {
    return state;
  }

  const narrowsForMessage = getNarrowsForMessage(message, action.ownUserId, flags);
  const anyNarrowIsCaughtUp = narrowsForMessage.some(narrow => {
    const key = keyFromNarrow(narrow);
    // (No guarantee that `key` is in `action.caughtUp`)
    // flowlint-next-line unnecessary-optional-chain:off
    return caughtUp[key]?.newer;
  });

  // Don't bother adding the message to `state.messages` if it wasn't
  // added to `state.narrows`. For why the message might not have been
  // added to `state.narrows`, see the condition on `caughtUp` in
  // narrowsReducer's handling of EVENT_NEW_MESSAGE.
  if (!anyNarrowIsCaughtUp) {
    return state;
  }

  // If changing or adding case where we ignore a message here:
  // Careful! Every message in `state.narrows` must exist in
  // `state.messages`. If we choose not to include a message in
  // `state.messages`, then narrowsReducer MUST ALSO choose not to
  // include it in `state.narrows`.

  return state.set(action.message.id, omit(action.message, 'flags'));
};

export default (
  state: MessagesState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
  globalState: PerAccountState,
): MessagesState => {
  switch (action.type) {
    case REGISTER_COMPLETE:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_COMPLETE:
      return state.merge(
        Immutable.Map(
          action.messages.map(message => [
            message.id,
            omit(message, ['flags', 'match_content', 'match_subject']),
          ]),
        ),
      );

    case EVENT_REACTION_ADD:
      return state.update(
        action.message_id,
        <M: Message>(oldMessage: M): M =>
          oldMessage && {
            ...(oldMessage: M),
            reactions: oldMessage.reactions.concat({
              emoji_name: action.emoji_name,
              user_id: action.user_id,
              reaction_type: action.reaction_type,
              emoji_code: action.emoji_code,
            }),
          },
      );

    case EVENT_REACTION_REMOVE:
      return state.update(
        action.message_id,
        <M: Message>(oldMessage: M): M =>
          oldMessage && {
            ...(oldMessage: M),
            reactions: oldMessage.reactions.filter(
              x => !(x.emoji_name === action.emoji_name && x.user_id === action.user_id),
            ),
          },
      );

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    case EVENT_SUBMESSAGE:
      return state.update(
        action.message_id,
        <M: Message>(message: M): M =>
          message && {
            ...(message: M),
            submessages: [
              ...(message.submessages ?? []),
              {
                id: action.submessage_id,
                message_id: action.message_id,
                sender_id: action.sender_id,
                msg_type: action.msg_type,
                content: action.content,
              },
            ],
          },
      );

    case EVENT_MESSAGE_DELETE:
      return state.deleteAll(action.messageIds);

    case EVENT_UPDATE_MESSAGE: {
      const { event, move } = action;
      let result = state;

      result = result.update(event.message_id, <M: Message>(oldMessage: M): M => {
        if (!oldMessage) {
          return oldMessage;
        }

        return {
          ...(oldMessage: M),
          content: event.rendered_content ?? oldMessage.content,
          last_edit_timestamp: event.edit_timestamp ?? oldMessage.last_edit_timestamp,
          // TODO(#3408): Update edit_history, too.  This is OK for now
          //   because we don't actually have any UI to expose it: #4134.
        };
      });

      if (move) {
        const update: { subject: string, stream_id?: number, display_recipient?: string } = {
          subject: move.new_topic,
          // TODO(#3408): Update topic_links.  This is OK for now
          //   because we don't have any UI to expose it.
          // TODO(#3408): Update last_edit_timestamp, probably.  But want to
          //   say "moved" in the UI in this case, not "edited".
        };
        if (move.new_stream_id !== move.orig_stream_id) {
          update.stream_id = move.new_stream_id;
          const newStream = getStreamsById(globalState).get(move.new_stream_id);
          // It's normal for newStream to potentially be missing here: it
          // happens when the move was to a stream our user can't see.
          // TODO(i18n): Not sure this "unknown" ever reaches the UI, but
          //   it'd be nice to somehow translate it in case it can.
          update.display_recipient = newStream?.name ?? 'unknown';
        }

        // eslint-disable-next-line no-shadow
        result = result.withMutations(state => {
          for (const id of event.message_ids) {
            state.update(id, <M: Message>(oldMessage: M | void): M | void => {
              if (!oldMessage) {
                return oldMessage;
              }

              // FlowIssue: https://github.com/facebook/flow/issues/8833
              //   The cast `: 'stream'` is silly but harmless, and works
              //   around a Flow issue which causes an error.
              if (oldMessage.type !== ('stream': 'stream')) {
                logging.warn('messagesReducer: got update_message with stream/topic move on PM');
                return oldMessage;
              }

              // TODO(#3408): Update edit_history, too.  This is OK for now
              //   because we don't actually have any UI to expose it: #4134.
              return { ...oldMessage, ...update };
            });
          }
        });
      }

      return result;
    }

    default:
      return state;
  }
};
