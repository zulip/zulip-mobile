/* @flow strict-local */
import type { Action, Dispatch, GetState, SettingsState } from '../types';
import { SETTINGS_CHANGE } from '../actionConstants';
import { sentrySetUsername } from '../sentry';

export const settingsChange = (update: $Shape<SettingsState>): Action => ({
  type: SETTINGS_CHANGE,
  update,
});

export const diagnosticNicknameChange = (diagnosticNickname: string) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  dispatch(settingsChange({ diagnosticNickname }));
  sentrySetUsername(diagnosticNickname);
};
