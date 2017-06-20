/* @flow */
import { SettingsState, Action } from '../types';
import { SETTINGS_CHANGE } from '../actionConstants';

const initialState: SettingsState = {
  locale: 'en',
  theme: 'default',
};

export default (state: SettingsState = initialState, action: Action): SettingsState => {
  switch (action.type) {
    case SETTINGS_CHANGE:
      return {
        ...state,
        [action.key]: action.value,
      };
    default:
      return state;
  }
};
