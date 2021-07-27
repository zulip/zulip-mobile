/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { AppState, View, Platform, NativeModules } from 'react-native';
// $FlowFixMe[untyped-import]
import NetInfo from '@react-native-community/netinfo';
import * as ScreenOrientation from 'expo-screen-orientation';

import type { Dispatch, Orientation as OrientationT } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { getUnreadByHuddlesMentionsAndPMs } from '../selectors';
import { handleInitialNotification, NotificationListener } from '../notification';
import { ShareReceivedListener, handleInitialShare } from '../sharing';
import { appOnline, appOrientation } from '../actions';
import PresenceHeartbeat from '../presence/PresenceHeartbeat';

/**
 * Part of the interface from react-native-netinfo.
 * https://github.com/react-native-community/react-native-netinfo/tree/v3.2.1
 */
// TODO: upgrade to 4.x.x so that we can use the `flow-typed` versions.
// Requires RN 0.60+.
type NetInfoStateType =
  | 'unknown'
  | 'none'
  | 'cellular'
  | 'wifi'
  | 'bluetooth'
  | 'ethernet'
  | 'wimax'
  | 'vpn'
  | 'other';

type NetInfoConnectedDetails = {
  isConnectionExpensive: boolean,
  ...
};

type NetInfoState = {
  /** The type of the current connection. */
  type: NetInfoStateType,

  /** Whether there is an active network connection. Note that this DOES NOT
      mean that the Internet is reachable. */
  isConnected: boolean,

  /**
   * This actually has a more complicated type whose exact shape is dependent on
   * the value of `type`, above. (Flow could describe it, but we don't have a
   * use for it yet.)
   */
  details: null | NetInfoConnectedDetails,
  ...
};

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  children: Node,
  unreadCount: number,
|}>;

type OrientationLookup = {|
  [expoKey: $Values<typeof ScreenOrientation.Orientation>]: OrientationT,
|};

const orientationLookup: OrientationLookup = {
  [ScreenOrientation.Orientation.UNKNOWN]: 'PORTRAIT',
  [ScreenOrientation.Orientation.PORTRAIT_UP]: 'PORTRAIT',
  [ScreenOrientation.Orientation.PORTRAIT_DOWN]: 'PORTRAIT',
  [ScreenOrientation.Orientation.LANDSCAPE_LEFT]: 'LANDSCAPE',
  [ScreenOrientation.Orientation.LANDSCAPE_RIGHT]: 'LANDSCAPE',
};

class AppEventHandlers extends PureComponent<Props> {
  /** NetInfo disconnection callback. */
  netInfoDisconnectCallback: (() => void) | null = null;

  handleOrientationChange = (event: ScreenOrientation.OrientationChangeEvent) => {
    const { dispatch } = this.props;

    const { orientation } = event.orientationInfo;

    dispatch(appOrientation(orientationLookup[orientation]));
  };

  // https://github.com/react-native-community/react-native-netinfo/tree/v3.2.1
  handleConnectivityChange = (netInfoState: NetInfoState) => {
    const { dispatch } = this.props;
    const { type: connectionType } = netInfoState;
    const isConnected = connectionType !== 'none' && connectionType !== 'unknown';
    dispatch(appOnline(isConnected));
  };

  /** For the type, see docs: https://reactnative.dev/docs/appstate */
  handleAppStateChange = (state: 'active' | 'background' | 'inactive') => {
    const { unreadCount } = this.props;
    if (state === 'background' && Platform.OS === 'android') {
      NativeModules.BadgeCountUpdaterModule.setBadgeCount(unreadCount);
    }
  };

  notificationListener = new NotificationListener(this.props.dispatch);
  shareListener = new ShareReceivedListener(this.props.dispatch);

  handleMemoryWarning = () => {
    // Release memory here
  };

  componentDidMount() {
    const { dispatch } = this.props;
    handleInitialNotification(dispatch);
    handleInitialShare(dispatch);

    this.netInfoDisconnectCallback = NetInfo.addEventListener(this.handleConnectivityChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);
    ScreenOrientation.addOrientationChangeListener(this.handleOrientationChange);
    this.notificationListener.start();
    this.shareListener.start();
  }

  componentWillUnmount() {
    if (this.netInfoDisconnectCallback) {
      this.netInfoDisconnectCallback();
      this.netInfoDisconnectCallback = null;
    }
    AppState.removeEventListener('change', this.handleAppStateChange);
    AppState.removeEventListener('memoryWarning', this.handleMemoryWarning);
    ScreenOrientation.removeOrientationChangeListeners();
    this.notificationListener.stop();
    this.shareListener.stop();
  }

  render() {
    return (
      <>
        <PresenceHeartbeat />
        <View style={styles.wrapper}>{this.props.children}</View>
      </>
    );
  }
}

export default connect(state => ({
  unreadCount: getUnreadByHuddlesMentionsAndPMs(state),
}))(AppEventHandlers);
