/* @flow strict-local */
import type { RealmState, Action, RealmEmojiById } from '../types';
import {
  REALM_INIT,
  EVENT_REALM_EMOJI_UPDATE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTERS,
} from '../actionConstants';
import { objectFromEntries } from '../jsBackport';

// Initial state
const initialState = {
  canCreateStreams: true,
  crossRealmBots: [],
  email: undefined,
  user_id: undefined,
  twentyFourHourTime: false,
  emoji: {},
  filters: [],
  isAdmin: false,
  nonActiveUsers: [],
};

/**
 * A version of `initialState` with some made-up blank data.
 *
 * On `LOGIN_SUCCESS`, we go straight to showing the main app UI (see
 * `navReducer`) even though we're still loading the actual data from the
 * server.  So we need some fake data that the UI code will swallow.
 * TODO: Probably stop doing that.
 *
 * Also: On `ACCOUNT_SWITCH`, during the transition animation, some old
 * components can still be mounted from the UI for the previous account that
 * make no sense without server data.  Probably ditto `LOGOUT`.
 */
const fakeBlankState = {
  ...initialState,
  email: '',
  user_id: 0,
};

const convertRealmEmoji = (data): RealmEmojiById =>
  objectFromEntries(Object.keys(data).map(id => [id, { ...data[id], code: id.toString() }]));

export default (state: RealmState = initialState, action: Action): RealmState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return fakeBlankState;

    case REALM_INIT: {
      return {
        ...state,
        canCreateStreams: action.data.can_create_streams,
        crossRealmBots: action.data.cross_realm_bots,
        email: action.data.email,
        user_id: action.data.user_id,
        emoji: convertRealmEmoji(action.data.realm_emoji),
        filters: action.data.realm_filters,
        isAdmin: action.data.is_admin,
        nonActiveUsers: action.data.realm_non_active_users,
        twentyFourHourTime: action.data.twenty_four_hour_time,
      };
    }

    // TODO on EVENT_USER_UPDATE for self: update email, isAdmin, etc.

    case EVENT_REALM_FILTERS:
      return {
        ...state,
        filters: action.realm_filters,
      };

    case EVENT_REALM_EMOJI_UPDATE:
      return {
        ...state,
        emoji: convertRealmEmoji(action.realm_emoji),
      };

    case EVENT_UPDATE_DISPLAY_SETTINGS:
      switch (action.setting_name) {
        case 'twenty_four_hour_time':
          return { ...state, twentyFourHourTime: action.setting };
        default:
          return state;
      }

    default:
      return state;
  }
};
