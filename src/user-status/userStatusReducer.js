/* @flow strict-local */
import Immutable from 'immutable';

import { makeUserId } from '../api/idTypes';
import objectEntries from '../utils/objectEntries';
import type { ReadWrite } from '../generics';
import type { UserStatus, UserStatusState, PerAccountApplicableAction } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  REGISTER_COMPLETE,
  EVENT_USER_STATUS_UPDATE,
} from '../actionConstants';

const initialState: UserStatusState = Immutable.Map();

export default (
  state: UserStatusState = initialState,
  action: PerAccountApplicableAction,
): UserStatusState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
      return Immutable.Map(
        objectEntries(action.data.user_status ?? {}).map(([id, status]) => [
          makeUserId(Number.parseInt(id, 10)),
          status,
        ]),
      );

    case EVENT_USER_STATUS_UPDATE: {
      const oldUserStatus = state.get(action.user_id);
      const newUserStatus: ReadWrite<UserStatus> = { ...oldUserStatus };
      if (action.away !== undefined) {
        if (action.away === true) {
          newUserStatus.away = action.away;
        } else {
          delete newUserStatus.away;
        }
      }
      if (action.status_text !== undefined) {
        if (action.status_text.length > 0) {
          newUserStatus.status_text = action.status_text;
        } else {
          delete newUserStatus.status_text;
        }
      }
      return state.set(action.user_id, newUserStatus);
    }

    default:
      return state;
  }
};
