/* @flow strict-local */
import type { Action, RecentPrivateConversationsState } from '../types';
import { REALM_INIT } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: RecentPrivateConversationsState = NULL_ARRAY;

export default (
  state: RecentPrivateConversationsState = initialState,
  action: Action,
): RecentPrivateConversationsState => {
  switch (action.type) {
    case REALM_INIT:
      return /* action.data.recent_private_conversations || */ initialState;
    default:
      return state;
  }
};
