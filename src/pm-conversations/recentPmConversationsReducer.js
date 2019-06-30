/* @flow strict-local */
import isEqual from 'lodash.isequal';

import type { Action, RecentPrivateConversationsState } from '../types';
import { REALM_INIT, EVENT_NEW_MESSAGE } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: RecentPrivateConversationsState = NULL_ARRAY;

const newMessage = (state, action) => {
  if (action.message.type !== 'private') {
    return state;
  }

  const userIds = action.message.display_recipient.map(recipient => recipient.id);
  const index = state.findIndex(item => isEqual(item.user_ids, userIds));
  const oldMaxMsgId = index < 0 ? null : state[index].max_message_id;
  const item = {
    user_ids: userIds,
    max_message_id: Math.max(action.message.id, oldMaxMsgId ?? -Infinity),
  };

  const unsorted =
    index < 0
      ? [item, ...state] /* force linebreak */
      : [item, ...state.slice(0, index), ...state.slice(index + 1)];

  return unsorted.sort((a, b) => -(a.max_message_id - b.max_message_id));
};

export default (
  state: RecentPrivateConversationsState = initialState,
  action: Action,
): RecentPrivateConversationsState => {
  switch (action.type) {
    case REALM_INIT:
      return action.data.recent_private_conversations || initialState;
    case EVENT_NEW_MESSAGE:
      return newMessage(state, action);
    default:
      return state;
  }
};
