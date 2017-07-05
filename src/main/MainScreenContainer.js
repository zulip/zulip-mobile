/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';
import DeviceInfo from 'react-native-device-info';

import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { getShownMessagesInActiveNarrow } from '../chat/chatSelectors';
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

  render() {
    return (
      <MainScreen {...this.props} />
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
  narrow: state.chat.narrow,
  messages: getShownMessagesInActiveNarrow(state),
  orientation: state.app.orientation,
}), boundActions)(MainScreenContainer);
