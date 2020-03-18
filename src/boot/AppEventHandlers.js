/* @flow strict-local */

import React, { PureComponent } from 'react';
import { AppState, View, StyleSheet, Platform, NativeModules } from 'react-native';
import SafeArea from 'react-native-safe-area';

import type { Node as React$Node } from 'react';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { getUnreadByHuddlesMentionsAndPMs } from '../selectors';
import {
  handleInitialNotification,
  NotificationListener,
  notificationOnAppActive,
} from '../notification';
import { initSafeAreaInsets } from '../actions';
import PresenceHeartbeat from '../presence/PresenceHeartbeat';
import NetworkStateHandler from './event-handlers/NetworkStateHandler';
import OrientationStateHandler from './event-handlers/OrientationHandler';

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

// TODO: After upgrading or replacing our iOS notifications library, look into
//   organizing NotificationListener and the notification-related components of
//   this file into another event-handler component.

class AppEventHandlers extends PureComponent<Props> {
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

  componentDidMount() {
    const { dispatch } = this.props;
    handleInitialNotification(dispatch);

    AppState.addEventListener('change', this.handleAppStateChange);
    SafeArea.getSafeAreaInsetsForRootView().then(params =>
      dispatch(initSafeAreaInsets(params.safeAreaInsets)),
    );
    this.notificationListener.start();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.notificationListener.stop();
  }

  render() {
    return (
      <>
        <NetworkStateHandler />
        <OrientationStateHandler />
        <PresenceHeartbeat />
        <View style={styles.wrapper}>{this.props.children}</View>
      </>
    );
  }
}

export default connect(state => ({
  unreadCount: getUnreadByHuddlesMentionsAndPMs(state),
}))(AppEventHandlers);
