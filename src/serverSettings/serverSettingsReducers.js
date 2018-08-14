/* @flow */
import type { ServerSettingsState } from '../types';
import { NULL_OBJECT } from '../nullObjects';

const initialState: ServerSettingsState = NULL_OBJECT;

export default (state: ServerSettingsState = initialState, action): ServerSettingsState => {
  switch (action.type) {
    default:
      return state;
  }
};
