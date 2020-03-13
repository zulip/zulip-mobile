/* @flow strict-local */

import React, { PureComponent } from 'react';
import { AppState, View, StyleSheet, Platform, NativeModules } from 'react-native';
import SafeArea from 'react-native-safe-area';
import Orientation, { type Orientations } from 'react-native-orientation';

import type { Node as React$Node } from 'react';
import type { Dispatch } from '../types';
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
  // The libdef says that this parameter is optional. The docs disagree.
  handleOrientationChange = (orientation?: Orientations) => {
    if (!orientation) {
      return;
    }

    // Lookup table. More elaborate than a simple 'orientation !== LANDSCAPE'
    // test to ensure robustness against future additions to the enumeration.
    const converter = {
      LANDSCAPE: 'LANDSCAPE',
      PORTRAIT: 'PORTRAIT',
      PORTRAITUPSIDEDOWN: 'PORTRAIT',
      UNKNOWN: 'PORTRAIT',
    };
    const converted = converter[orientation];

    const { dispatch } = this.props;
    dispatch(appOrientation(converted));
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

  componentDidMount() {
    const { dispatch } = this.props;
    handleInitialNotification(dispatch);

    AppState.addEventListener('change', this.handleAppStateChange);
    SafeArea.getSafeAreaInsetsForRootView().then(params =>
      dispatch(initSafeAreaInsets(params.safeAreaInsets)),
    );
    Orientation.addOrientationListener(this.handleOrientationChange);
    this.notificationListener.start();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
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
