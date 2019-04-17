/* @flow strict-local */

import React, { PureComponent } from 'react';
import { AppState, NetInfo, View, StyleSheet, Platform, NativeModules } from 'react-native';
import SafeArea from 'react-native-safe-area';
import Orientation from 'react-native-orientation';

import type { Node as React$Node } from 'react';
import type { Dispatch, Orientation as OrientationT } from '../types';
import { connect } from '../react-redux';
import { getUnreadByHuddlesMentionsAndPMs } from '../selectors';
import { handleInitialNotification, NotificationListener } from '../notification';
import {
  appOnline,
  appOrientation,
  appState,
  initSafeAreaInsets,
  reportPresence,
} from '../actions';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

type Props = {|
  dispatch: Dispatch,
  children: React$Node,
  unreadCount: number,
|};

class AppEventHandlers extends PureComponent<Props> {
  handleOrientationChange = (orientation: OrientationT) => {
    const { dispatch } = this.props;
    dispatch(appOrientation(orientation));
  };

  handleConnectivityChange = connectionInfo => {
    const { dispatch } = this.props;
    const isConnected = connectionInfo.type !== 'none' && connectionInfo.type !== 'unknown';
    dispatch(appOnline(isConnected));
  };

  handleAppStateChange = state => {
    const { dispatch, unreadCount } = this.props;
    dispatch(reportPresence(state === 'active'));
    dispatch(appState(state === 'active'));
    if (state === 'background' && Platform.OS === 'android') {
      NativeModules.BadgeCountUpdaterModule.setBadgeCount(unreadCount);
    }
  };

  notificationListener = new NotificationListener(this.props.dispatch);

  handleMemoryWarning = () => {
    // Release memory here
  };

  componentDidMount() {
    const { dispatch } = this.props;
    handleInitialNotification(dispatch);

    NetInfo.addEventListener('connectionChange', this.handleConnectivityChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);
    SafeArea.getSafeAreaInsetsForRootView().then(params =>
      dispatch(initSafeAreaInsets(params.safeAreaInsets)),
    );
    // $FlowFixMe: libdef wrongly says callback's parameter is optional
    Orientation.addOrientationListener(this.handleOrientationChange);
    this.notificationListener.start();
  }

  componentWillUnmount() {
    NetInfo.removeEventListener('connectionChange', this.handleConnectivityChange);
    AppState.removeEventListener('change', this.handleAppStateChange);
    AppState.removeEventListener('memoryWarning', this.handleMemoryWarning);
    // $FlowFixMe: libdef wrongly says callback's parameter is optional
    Orientation.removeOrientationListener(this.handleOrientationChange);
    this.notificationListener.stop();
  }

  render() {
    return <View style={styles.wrapper}>{this.props.children}</View>;
  }
}

export default connect(state => ({
  unreadCount: getUnreadByHuddlesMentionsAndPMs(state),
}))(AppEventHandlers);
