/* @flow */
import type {
  RealmState,
  RealmAction,
  RealmInitAction,
  SaveTokenPushAction,
  DeleteTokenPushAction,
  LoginSuccessAction,
  LogoutAction,
  InitRealmEmojiAction,
  InitRealmFilterAction,
  EventRealmFilterUpdateAction,
  EventRealmEmojiUpdateAction,
} from '../types';
import {
  APP_REFRESH,
  REALM_INIT,
  EVENT_REALM_EMOJI_UPDATE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  INIT_REALM_EMOJI,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  SAVE_TOKEN_PUSH,
  DELETE_TOKEN_PUSH,
  INIT_REALM_FILTER,
  EVENT_REALM_FILTER_UPDATE,
} from '../actionConstants';

// Initial state
const initialState = {
  twentyFourHourTime: false,
  pushToken: { token: '', result: '', msg: '' },
  emoji: {},
  filters: [],
};

const realmInit = (state: RealmState, action: RealmInitAction): RealmState => ({
  ...state,
  emoji: action.data.realm_emoji,
  filters: action.data.realm_filters,
  twentyFourHourTime: action.data.twenty_four_hour_time,
});

const saveTokenPush = (state: RealmState, action: SaveTokenPushAction): RealmState => ({
  ...state,
  pushToken: {
    token: action.pushToken,
    result: action.result,
    msg: action.msg,
  },
});

const deleteTokenPush = (state: RealmState, action: DeleteTokenPushAction): RealmState => ({
  ...state,
  pushToken: { token: '', result: '', msg: '' },
});

const loginChange = (state: RealmState, action: LoginSuccessAction | LogoutAction): RealmState => ({
  ...state,
  emoji: {},
  pushToken: { token: '', result: '', msg: '' },
});

const initRealmEmoji = (state: RealmState, action: InitRealmEmojiAction): RealmState => ({
  ...state,
  emoji: action.emojis,
});

const initRealmFilter = (state: RealmState, action: InitRealmFilterAction): RealmState => ({
  ...state,
  filters: action.filters,
});

const eventRealmFilterUpdate = (
  state: RealmState,
  action: EventRealmFilterUpdateAction,
): RealmState => ({
  ...state,
  filters: action.realm_filters,
});

const eventRealmEmojiUpdate = (
  state: RealmState,
  action: EventRealmEmojiUpdateAction,
): RealmState => ({
  ...state,
  emoji: action.realm_emoji,
});

export default (state: RealmState = initialState, action: RealmAction): RealmState => {
  switch (action.type) {
    case APP_REFRESH:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return realmInit(state, action);

    case SAVE_TOKEN_PUSH:
      return saveTokenPush(state, action);

    case DELETE_TOKEN_PUSH:
      return deleteTokenPush(state, action);

    case LOGOUT:
    case LOGIN_SUCCESS:
      return loginChange(state, action);

    case INIT_REALM_EMOJI:
      return initRealmEmoji(state, action);

    case INIT_REALM_FILTER:
      return initRealmFilter(state, action);

    case EVENT_REALM_FILTER_UPDATE:
      return eventRealmFilterUpdate(state, action);

    case EVENT_REALM_EMOJI_UPDATE:
      return eventRealmEmojiUpdate(state, action);

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
