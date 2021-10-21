/* @flow strict-local */
// $FlowFixMe[untyped-import]
import omit from 'lodash.omit';
import Immutable from 'immutable';

import type { MessagesState, Message, PerAccountApplicableAction } from '../types';
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
  state: MessagesState = initialState,
  action: PerAccountApplicableAction,
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

    case EVENT_UPDATE_MESSAGE:
      return state.update(action.message_id, <M: Message>(oldMessage: M): M => {
        if (!oldMessage) {
          return oldMessage;
        }

        const historyEntry = (() => {
          if (action.edit_timestamp == null || action.user_id == null) {
            // The update isn't a real edit; rather it's just filling in an
            // inline URL preview (which can require the server to make an
            // external request, so we don't let it block delivering the
            // message to clients) and shouldn't appear in the edit history.
            return null;
          }
          if (action.orig_rendered_content !== undefined) {
            if (action.orig_subject !== undefined) {
              return {
                prev_rendered_content: action.orig_rendered_content,
                prev_subject: oldMessage.subject,
                timestamp: action.edit_timestamp,
                prev_rendered_content_version: action.prev_rendered_content_version,
                user_id: action.user_id,
              };
            } else {
              return {
                prev_rendered_content: action.orig_rendered_content,
                timestamp: action.edit_timestamp,
                prev_rendered_content_version: action.prev_rendered_content_version,
                user_id: action.user_id,
              };
            }
          } else {
            return {
              prev_subject: oldMessage.subject,
              timestamp: action.edit_timestamp,
              user_id: action.user_id,
            };
          }
        })();

        const messageWithNewCommonFields: M = {
          ...(oldMessage: M),
          content: action.rendered_content ?? oldMessage.content,
          edit_history: historyEntry
            ? [historyEntry, ...(oldMessage.edit_history ?? [])]
            : oldMessage.edit_history,
          last_edit_timestamp: action.edit_timestamp ?? oldMessage.last_edit_timestamp,
        };

        // FlowIssue: https://github.com/facebook/flow/issues/8833
        //   The cast `: 'stream'` is silly but harmless, and works
        //   around a Flow issue which causes an error.
        return messageWithNewCommonFields.type === ('stream': 'stream')
          ? {
              ...messageWithNewCommonFields,
              subject: action.subject ?? messageWithNewCommonFields.subject,
              subject_links: action.subject_links ?? messageWithNewCommonFields.subject_links,
            }
          : messageWithNewCommonFields;
      });

    default:
      return state;
  }
};
