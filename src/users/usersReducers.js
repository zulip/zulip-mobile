/* @flow */
import type { UsersState, UsersAction, RealmInitAction, EventUserAddAction } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  REALM_INIT,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UsersState = NULL_ARRAY;

const realmInit = (state: UsersState, action: RealmInitAction): UsersState => {
  // Array spread would look nicer, but it creates a copy of every user in
  // realm_users, which is slow. Push appends cross_realm_bots to
  // realm_users, which is fast because it only copies cross_realm_bots and
  // there are only four cross realm bots. Also, add the properties timezone
  // and avatar_url to each cross realm bot if they are not present. This is
  // needed to stay compatible with Zulip servers prior to commit
  // zulip/zulip:58ee3fa8c4
  action.data.realm_users.push(
    ...action.data.cross_realm_bots.map(bot => ({
      ...bot,
      timezone: bot.timezone || '',
      avatar_url: bot.avatar_url || null,
    })),
  );
  return action.data.realm_users;
};

const eventUserAdd = (state: UsersState, action: EventUserAddAction): UsersState => [
  ...state,
  action.person,
];

export default (state: UsersState = initialState, action: UsersAction): UsersState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return realmInit(state, action);

    case EVENT_USER_ADD:
      return eventUserAdd(state, action);

    case EVENT_USER_REMOVE:
      return state; // TODO

    case EVENT_USER_UPDATE:
      return state; // TODO

    default:
      return state;
  }
};
