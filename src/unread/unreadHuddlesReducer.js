/* @flow strict-local */
import invariant from 'invariant';

import type { PerAccountApplicableAction } from '../types';
import type { UnreadHuddlesState } from './unreadModelTypes';
import {
  REGISTER_COMPLETE,
  LOGOUT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  LOGIN_SUCCESS,
} from '../actionConstants';
import {
  pmUnreadsKeyFromMessage,
  pmUnreadsKeyFromOtherUsers,
  recipientsOfPrivateMessage,
} from '../utils/recipient';
import { addItemsToHuddleArray, removeItemsDeeply } from './unreadHelpers';
import { NULL_ARRAY } from '../nullObjects';
import * as logging from '../utils/logging';
import type { PerAccountState } from '../reduxTypes';
import { getOwnUserId } from '../users/userSelectors';

const initialState: UnreadHuddlesState = NULL_ARRAY;

const eventNewMessage = (state, action) => {
  const { message } = action;

  if (message.type !== 'private') {
    return state;
  }

  if (recipientsOfPrivateMessage(message).length < 3) {
    return state;
  }

  invariant(message.flags, 'message in EVENT_NEW_MESSAGE must have flags');
  if (message.flags.includes('read')) {
    return state;
  }

  return addItemsToHuddleArray(state, [message.id], pmUnreadsKeyFromMessage(message));
};

const eventUpdateMessageFlags = (state, action, ownUserId) => {
  if (action.flag !== 'read') {
    return state;
  }

  if (action.all) {
    return initialState;
  }

  if (action.op === 'add') {
    return removeItemsDeeply(state, action.messages);
  } else if (action.op === 'remove') {
    const { message_details } = action;
    if (message_details === undefined) {
      logging.warn('Got update_message_flags/remove/read event without message_details.');
      return state;
    }

    let newState = state;

    for (const id of action.messages) {
      const message = message_details.get(id);
      if (message && message.type === 'private' && message.user_ids.length >= 2) {
        const unreadsKey = pmUnreadsKeyFromOtherUsers(message.user_ids, ownUserId);
        newState = addItemsToHuddleArray(newState, [id], unreadsKey);
      }
    }

    // TODO This re-sorting/deduping is pretty overkill; only the
    //   conversations we actually touched need it.  But rather than add
    //   complications to the `addItemsTo…` system to support that, let's
    //   spend that effort instead to finally rip that system out in favor
    //   of Immutable.js.
    return newState.map(({ user_ids_string, unread_message_ids }) => ({
      user_ids_string,
      unread_message_ids: [...new Set(unread_message_ids)].sort((a, b) => a - b),
    }));
  }

  return state;
};

export default (
  state: UnreadHuddlesState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
  globalState: PerAccountState,
): UnreadHuddlesState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
    case LOGIN_SUCCESS:
      return initialState;

    case REGISTER_COMPLETE:
      return (
        (action.data.unread_msgs && action.data.unread_msgs.huddles)
        // TODO(#5102): Delete fallback once we refuse to connect to Zulip
        //   servers before 1.7.0, when it seems this feature was added; see
        //   comment on InitialDataUpdateMessageFlags.
        || initialState
      );

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    case EVENT_MESSAGE_DELETE:
      return removeItemsDeeply(state, action.messageIds);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action, getOwnUserId(globalState));

    default:
      return state;
  }
};
