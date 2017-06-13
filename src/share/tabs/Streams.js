import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../../boundActions';
import { getAuth } from '../../account/accountSelectors';
import sendMessage from '../../api/sendMessage';
import StreamList from '../../streamlist/StreamList';
import { getInitialRoutes } from '../../nav/routingSelectors';

class Streams extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'Streams'
  };

  sendMessage = (newNarrow, topic) => {
    const { auth, data, removeData, initRoutes, accounts } = this.props;
    sendMessage(auth, 'stream', newNarrow, topic, data);
    removeData();
    initRoutes(getInitialRoutes(accounts));
  };

  render() {
    const { subscriptions, expandStream, expandedStreamName } = this.props;
    return (
      <StreamList
        streams={subscriptions}
        onNarrow={expandStream}
        onSend={this.sendMessage}
        expandedStreamName={expandedStreamName}
        shareScreen
      />
    );
  }
}

export default connect(
  state => ({
    subscriptions: state.subscriptions,
    auth: getAuth(state),
    expandedStreamName: state.share.expandedStreamName,
    data: state.share.shareData,
    accounts: state.accounts,
  }),
  boundActions
)(Streams);
