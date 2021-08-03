/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node, ComponentType } from 'react';
import { AppState, View, Platform, NativeModules } from 'react-native';
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

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

type OuterProps = $ReadOnly<{|
  children: Node,
|}>;

type SelectorProps = $ReadOnly<{|
  unreadCount: number,
|}>;

type Props = $ReadOnly<{|
  ...OuterProps,

  // from `connect`
  dispatch: Dispatch,
  ...SelectorProps,
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

class AppEventHandlersInner extends PureComponent<Props> {
  /** NetInfo disconnection callback. */
  netInfoDisconnectCallback: (() => void) | null = null;

  handleOrientationChange = (event: ScreenOrientation.OrientationChangeEvent) => {
    const { dispatch } = this.props;

    const { orientation } = event.orientationInfo;

    dispatch(appOrientation(orientationLookup[orientation]));
  };

  handleConnectivityChange = netInfoState => {
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

const AppEventHandlers: ComponentType<OuterProps> = connect(state => ({
  unreadCount: getUnreadByHuddlesMentionsAndPMs(state),
}))(AppEventHandlersInner);

export default AppEventHandlers;
