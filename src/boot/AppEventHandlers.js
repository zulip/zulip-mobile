/* @flow */
import React, { PureComponent } from 'react';
import { AppState, NetInfo, View, StyleSheet, Platform, NativeModules } from 'react-native';
import SafeArea from 'react-native-safe-area';
import Orientation from 'react-native-orientation';

import type { Auth, Actions, ChildrenArray } from '../types';
import connectWithActions from '../connectWithActions';
import { getAuth, getUnreadByHuddlesMentionsAndPMs } from '../selectors';
import {
  addNotificationListener,
  removeNotificationListener,
  handlePendingNotifications,
  tryInitialNotification,
} from '../utils/notifications';

const componentStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

type Props = {
  auth: Auth,
  needsInitialFetch: boolean,
  actions: Actions,
  children?: ChildrenArray<*>,
  unreadCount: number,
};

class AppEventHandlers extends PureComponent<Props> {
  props: Props;

  handleOrientationChange = orientation => {
    const { actions } = this.props;
    actions.appOrientation(orientation);
  };

  handleConnectivityChange = connectionInfo => {
    const { actions, needsInitialFetch } = this.props;
    const isConnected = connectionInfo.type !== 'none' && connectionInfo.type !== 'unknown';
    actions.appOnline(isConnected);
    if (!needsInitialFetch && isConnected) {
      actions.trySendMessages();
    }
  };

  handleAppStateChange = state => {
    const { actions, unreadCount } = this.props;
    actions.sendFocusPing(state === 'active');
    actions.appState(state === 'active');
    if (state === 'background' && Platform.OS === 'android') {
      NativeModules.BadgeCountUpdaterModule.setBadgeCount(unreadCount);
    }
  };

  handleNotificationOpen = (notification: Object) => {
    const { actions } = this.props;
    actions.saveInitialNotificationDetails(notification.getData());
    setTimeout(() => handlePendingNotifications(notification), 600);
  };

  handleMemoryWarning = () => {
    // Release memory here
  };

  componentWillMount() {
    const { actions } = this.props;
    tryInitialNotification();

    NetInfo.addEventListener('connectionChange', this.handleConnectivityChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);
    SafeArea.getSafeAreaInsetsForRootView().then(actions.initSafeAreaInsets);
    Orientation.addOrientationListener(this.handleOrientationChange);
    addNotificationListener(this.handleNotificationOpen);
  }

  componentWillUnmount() {
    NetInfo.removeEventListener('connectionChange', this.handleConnectivityChange);
    AppState.removeEventListener('change', this.handleAppStateChange);
    AppState.removeEventListener('memoryWarning', this.handleMemoryWarning);
    Orientation.removeOrientationListener(this.handleOrientationChange);
    removeNotificationListener(this.handleNotificationOpen);
  }

  render() {
    return <View style={componentStyles.wrapper}>{this.props.children}</View>;
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  needsInitialFetch: state.app.needsInitialFetch,
  unreadCount: getUnreadByHuddlesMentionsAndPMs(state),
}))(AppEventHandlers);
