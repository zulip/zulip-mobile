import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { getRecentConversations } from '../chat/chatSelectors';
import sendMessage from '../api/sendMessage';
import { Screen } from '../common';
import ConversationList from '../conversations/ConversationList';

class ShareScreen extends React.Component {

  handleSelect = (newNarrow) => {
    const { auth, data } = this.props;
    sendMessage(auth, 'private', newNarrow, '', data);
  }

  render() {
    const { conversations, realm, users, narrow } = this.props;
    return (
      <Screen title="Share with">
        <ConversationList
          conversations={conversations}
          realm={realm}
          users={users}
          narrow={narrow}
          shareScreen
          onNarrow={newNarrow => {
            this.handleSelect(newNarrow);
          }}
        />
      </Screen>
    );
  }
}

export default connect(state => ({
  realm: getAuth(state).realm,
  narrow: state.chat.narrow,
  users: state.users,
  conversations: getRecentConversations(state),
  auth: getAuth(state),
}), boundActions)(ShareScreen);
