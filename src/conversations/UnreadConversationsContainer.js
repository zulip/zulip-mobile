/* @flow */
import React from 'react';

import connectWithActions from '../connectWithActions';
import { getPresence, getUnreadConversations, getUsersByEmail } from '../selectors';
import { FlexView } from '../common';
import ConversationList from './ConversationList';

export default connectWithActions(state => ({
  conversations: getUnreadConversations(state),
  presences: getPresence(state),
  usersByEmail: getUsersByEmail(state),
}))(
  props =>
    props.conversations.length > 0 ? (
      <FlexView>
        <ConversationList {...props} />
      </FlexView>
    ) : null,
);
