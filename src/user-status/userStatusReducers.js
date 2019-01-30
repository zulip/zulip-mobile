/* @flow strict-local */
import type { UserStatusState, Action } from '../types';
import { NULL_OBJECT } from '../nullObjects';

const initialState: UserStatusState = NULL_OBJECT;

export default (state: UserStatusState = initialState, action: Action): UserStatusState => {
  switch (action.type) {
    default:
      return state;
  }
};
