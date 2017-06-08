import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../../boundActions';
import { getAuth } from '../../account/accountSelectors';
import sendMessage from '../../api/sendMessage';
import StreamList from '../../streamlist/StreamList';

class Streams extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'Streams'
  };

  handleSelect = newNarrow => {
    const { auth, data } = this.props;
    sendMessage(auth, 'stream', newNarrow, '(no topic)', data);
  };

  render() {
    const { subscriptions } = this.props;
    return (
      <StreamList
        streams={subscriptions}
        onNarrow={this.handleSelect}
        shareScreen
      />
    );
  }
}

export default connect(
  state => ({
    subscriptions: state.subscriptions,
    auth: getAuth(state)
  }),
  boundActions
)(Streams);
