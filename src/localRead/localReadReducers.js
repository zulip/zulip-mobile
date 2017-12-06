/* @flow */
import type { OutboxState, Action } from '../types';
import {
  MARK_MESSAGE_AS_READ_LOCALLY,
  LOGOUT,
  EVENT_UPDATE_MESSAGE_FLAGS,
  REALM_INIT,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState = NULL_ARRAY;

export default (state: OutboxState = initialState, action: Action): OutboxState => {
  switch (action.type) {
    case MARK_MESSAGE_AS_READ_LOCALLY: {
      return state.concat(action.messages.filter(messageId => !state.find(id => id === messageId)));
    }

    case EVENT_UPDATE_MESSAGE_FLAGS: {
      if (action.flag !== 'read') {
        return state;
      }

      if (action.operation === 'add') {
        return state.filter(id => !action.messages.find(messageId => messageId === id));
      } else if (action.operation === 'remove') {
        // we do not support that operation
      }

      return state;
    }

    case REALM_INIT:
    case LOGOUT:
      return initialState;

    default:
      return state;
  }
};
