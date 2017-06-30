/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';
import DeviceInfo from 'react-native-device-info';

import config from '../config';
import boundActions from '../boundActions';
import MainScreen from './MainScreen';
import { initializeNotifications } from '../utils/notifications';

class MainScreenContainer extends React.Component {
  componentWillMount() {
    const { auth, saveTokenPush, switchNarrow } = this.props;
    if (!DeviceInfo.isEmulator()) {
      initializeNotifications(auth, saveTokenPush, switchNarrow);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { auth, fetchMessagesAtFirstUnread, narrow } = this.props;

    if (!isEqual(narrow, nextProps.narrow) && nextProps.messages.length === 0) {
      fetchMessagesAtFirstUnread(auth, nextProps.narrow);
    }
  }

  fetchOlder = () => {
    const { auth, fetching, caughtUp, anchor, narrow, fetchMessages } = this.props;
    if (!fetching.older && !caughtUp.older && anchor) {
      fetchMessages(auth, anchor.older, config.messagesPerRequest, 0, narrow);
    }
  };

  fetchNewer = () => {
    const { auth, fetching, caughtUp, anchor, narrow, fetchMessages } = this.props;
    if (!fetching.newer && !caughtUp.newer && anchor) {
      fetchMessages(auth, anchor.newer, 0, config.messagesPerRequest, narrow);
    }
  };

  render() {
    return (
      <MainScreen
        fetchOlder={this.fetchOlder}
        fetchNewer={this.fetchNewer}
        {...this.props}
      />
    );
  }
}

export default connect(state => ({
  orientation: state.app.orientation,
}), boundActions)(MainScreenContainer);
