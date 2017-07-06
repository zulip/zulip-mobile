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
    const { auth, actions, switchNarrow } = this.props;
    if (!DeviceInfo.isEmulator()) {
      initializeNotifications(auth, actions.saveTokenPush, switchNarrow);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { auth, actions, narrow } = this.props;
    if (!isEqual(narrow, nextProps.narrow) && nextProps.messages.length === 0) {
      actions.fetchMessagesAtFirstUnread(auth, nextProps.narrow);
    }
  }

  render() {
    const { actions, messages, orientation } = this.props;
    return (
      <MainScreen
        actions={actions}
        messages={messages}
        orientation={orientation}
      />
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
  narrow: state.chat.narrow,
  messages: getShownMessagesInActiveNarrow(state),
  orientation: state.app.orientation,
  editMessage: state.app.editMessage,
}), boundActions)(MainScreenContainer);
