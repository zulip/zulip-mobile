/* @flow */
import type { NewServerSettingsAction, ServerSettingsState, ServerSettingsAction } from '../types';
import { NULL_OBJECT } from '../nullObjects';
import { NEW_SERVER_SETTINGS } from '../actionConstants';

const initialState: ServerSettingsState = NULL_OBJECT;

const newServerSettings = (
  state: ServerSettingsState,
  action: NewServerSettingsAction,
): ServerSettingsState => ({
  ...state,
  [action.serverSettings.realm_uri]: action.serverSettings,
});

export default (
  state: ServerSettingsState = initialState,
  action: ServerSettingsAction,
): ServerSettingsState => {
  switch (action.type) {
    case NEW_SERVER_SETTINGS:
      return newServerSettings(state, action);

    default:
      return state;
  }
};
