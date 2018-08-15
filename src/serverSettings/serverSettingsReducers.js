/* @flow */
import type {
  NewServerSettingsAction,
  RealmInitAction,
  ServerSettingsState,
  ServerSettingsAction,
} from '../types';
import { NULL_OBJECT } from '../nullObjects';
import { NEW_SERVER_SETTINGS, REALM_INIT } from '../actionConstants';

const initialState: ServerSettingsState = NULL_OBJECT;

const newServerSettings = (
  state: ServerSettingsState,
  action: NewServerSettingsAction,
): ServerSettingsState => ({
  ...state,
  [action.serverSettings.realm_uri]: action.serverSettings,
});

const realmInit = (state: ServerSettingsState, action: RealmInitAction): ServerSettingsState => ({
  ...state,
  [action.data.realm_uri]: {
    ...state[action.data.realm_uri],
    authentication_methods: action.data.realm_authentication_methods,
    realm_description: action.data.realm_description,
    realm_icon: action.data.realm_icon_url,
    realm_name: action.data.realm_name,
    realm_uri: action.data.realm_uri,
  },
});

export default (
  state: ServerSettingsState = initialState,
  action: ServerSettingsAction,
): ServerSettingsState => {
  switch (action.type) {
    case NEW_SERVER_SETTINGS:
      return newServerSettings(state, action);

    case REALM_INIT:
      return realmInit(state, action);

    default:
      return state;
  }
};
