/* @flow strict-local */

import React, { PureComponent } from 'react';
import { AppState, View, StyleSheet, Platform, NativeModules } from 'react-native';
import SafeArea from 'react-native-safe-area';
import Orientation from 'react-native-orientation';

import type { Node as React$Node } from 'react';
import type { Dispatch, Orientation as OrientationT } from '../types';
import { connect } from '../react-redux';
import { getUnreadByHuddlesMentionsAndPMs } from '../selectors';
import {
  handleInitialNotification,
  NotificationListener,
  notificationOnAppActive,
} from '../notification';
import { appOrientation, initSafeAreaInsets } from '../actions';
import PresenceHeartbeat from '../presence/PresenceHeartbeat';
import NetworkStateHandler from './event-handlers/NetworkStateHandler';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  children: React$Node,
  unreadCount: number,
|}>;

class AppEventHandlers extends PureComponent<Props> {
  handleOrientationChange = (orientation: OrientationT) => {
    const { dispatch } = this.props;
    dispatch(appOrientation(orientation));
  };

  /** For the type, see docs: https://facebook.github.io/react-native/docs/appstate */
  handleAppStateChange = (state: 'active' | 'background' | 'inactive') => {
    const { unreadCount } = this.props;
    if (state === 'background' && Platform.OS === 'android') {
      NativeModules.BadgeCountUpdaterModule.setBadgeCount(unreadCount);
    }
    if (state === 'active') {
      notificationOnAppActive();
    }
  };

  notificationListener = new NotificationListener(this.props.dispatch);

  handleMemoryWarning = () => {
    // Release memory here
  };

  componentDidMount() {
    const { dispatch } = this.props;
    handleInitialNotification(dispatch);

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
    AppState.removeEventListener('change', this.handleAppStateChange);
    AppState.removeEventListener('memoryWarning', this.handleMemoryWarning);
    // $FlowFixMe: libdef wrongly says callback's parameter is optional
    Orientation.removeOrientationListener(this.handleOrientationChange);
    this.notificationListener.stop();
  }

  render() {
    return (
      <>
        <NetworkStateHandler />
        <PresenceHeartbeat />
        <View style={styles.wrapper}>{this.props.children}</View>
      </>
    );
  }
}

export default connect(state => ({
  unreadCount: getUnreadByHuddlesMentionsAndPMs(state),
}))(AppEventHandlers);
