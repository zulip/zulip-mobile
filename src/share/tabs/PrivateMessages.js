import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../../boundActions';
import { getAuth } from '../../account/accountSelectors';
import { getRecentConversations } from '../../chat/chatSelectors';
import sendMessage from '../../api/sendMessage';
import ConversationList from '../../conversations/ConversationList';

class PrivateMessages extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'Private Messages'
  };

  handleSelect = newNarrow => {
    const { auth, data, popRoute, removeData } = this.props;
    sendMessage(auth, 'private', newNarrow, '', data);
    removeData();
    popRoute();
  };

  render() {
    const { conversations, realm, users, narrow } = this.props;
    return (
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
    );
  }
}

export default connect(
  state => ({
    realm: getAuth(state).realm,
    narrow: state.chat.narrow,
    users: state.users,
    conversations: getRecentConversations(state),
    auth: getAuth(state),
    data: state.share.shareData,
  }),
  boundActions
)(PrivateMessages);
