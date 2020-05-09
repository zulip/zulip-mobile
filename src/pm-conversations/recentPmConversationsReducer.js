/* @flow strict-local */
import type { Action, RecentPrivateConversationsState } from '../types';
import { REALM_INIT } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: RecentPrivateConversationsState = NULL_ARRAY;

const realmInit = (state, action) => {
  // If this is a pre-2.1 server, we'll have to get by without.
  if (action.data.recent_private_conversations === undefined) {
    return initialState;
  }

  // `user_id`s are not guaranteed to be sorted prior to v2.1.2.
  // (Take care not to mutate the input.)
  return action.data.recent_private_conversations.map(({ user_ids, ...rest }) => ({
    ...rest,
    user_ids: [...user_ids].sort((a, b) => a - b),
  }));
};

export default (
  state: RecentPrivateConversationsState = initialState,
  action: Action,
): RecentPrivateConversationsState => {
  switch (action.type) {
    case REALM_INIT:
      return realmInit(state, action);

    default:
      return state;
  }
};
