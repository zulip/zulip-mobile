/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';
import DeviceInfo from 'react-native-device-info';

import type { Actions, Auth, Message, Narrow } from '../types';
import boundActions from '../boundActions';
import { getAuth, getShownMessagesInActiveNarrow } from '../selectors';
import MainScreen from './MainScreen';
import { initializeNotifications } from '../utils/notifications';

class MainScreenContainer extends PureComponent {
  props: {
    auth: Auth,
    narrow: Narrow,
    actions: Actions,
    messages: Message[],
    orientation: string,
  };

  componentWillMount() {
    const { auth, actions } = this.props;
    if (!DeviceInfo.isEmulator()) {
      initializeNotifications(auth, actions.saveTokenPush, actions.switchNarrow);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { actions, narrow } = this.props;
    if (!isEqual(narrow, nextProps.narrow) && nextProps.messages.length === 0) {
      actions.fetchMessagesAtFirstUnread(nextProps.narrow);
    }
  }

  render() {
    const { actions, messages, orientation } = this.props;
    return <MainScreen actions={actions} messages={messages} orientation={orientation} />;
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
    narrow: state.chat.narrow,
    messages: getShownMessagesInActiveNarrow(state),
    orientation: state.app.orientation,
  }),
  boundActions,
)(MainScreenContainer);
