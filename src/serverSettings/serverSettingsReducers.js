/* @flow */
import type { ServerSettingsState, ServerSettingsAction } from '../types';
import { NULL_OBJECT } from '../nullObjects';

const initialState: ServerSettingsState = NULL_OBJECT;

export default (
  state: ServerSettingsState = initialState,
  action: ServerSettingsAction,
): ServerSettingsState => {
  switch (action.type) {
    default:
      return state;
  }
};
