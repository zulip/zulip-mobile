/* @flow strict-local */

import { objectFromEntries } from '../jsBackport';
import { makeUserId } from '../api/idTypes';
import objectEntries from '../utils/objectEntries';
import type { UserStatusState, PerAccountApplicableAction } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  REGISTER_COMPLETE,
  EVENT_USER_STATUS_UPDATE,
} from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';

const initialState: UserStatusState = NULL_OBJECT;

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
      return objectFromEntries(
        objectEntries(action.data.user_status ?? {}).map(([id, status]) => [
          // Converting from string keys to numeric ones here doesn't
          // actually make a difference to how the state is represented
          // at runtime. But it will when we start using
          // Immutable.Map<UserId, UserStatus> soon, and it satisfies
          // Flow.
          // TODO: Use Immutable.Map<UserId, UserStatus>
          makeUserId(Number.parseInt(id, 10)),
          status,
        ]),
      );

    case EVENT_USER_STATUS_UPDATE: {
      const newUserStatus = { ...state[action.user_id] };
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
      return {
        ...state,
        // TODO(flow): The cast here is because we've left this data
        //   structure's type with plain `number` for the key, to work
        //   around a Flow bug.  See the definition of the type
        //   `UserStatusState`.
        [(action.user_id: number)]: newUserStatus,
      };
    }

    default:
      return state;
  }
};
