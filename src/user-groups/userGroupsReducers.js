/* @flow */
import type { UserGroupsState, UserGroupsAction } from '../types';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UserGroupsState = NULL_ARRAY;

export default (
  state: UserGroupsState = initialState,
  action: UserGroupsAction,
): UserGroupsState => {
  switch (action.type) {
    default:
      return state;
  }
};
