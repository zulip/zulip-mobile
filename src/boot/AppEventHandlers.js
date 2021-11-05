/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node, ComponentType } from 'react';
import { AppState, View, Platform, NativeModules } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as ScreenOrientation from 'expo-screen-orientation';

import type { GlobalDispatch, Orientation as OrientationT } from '../types';
import { dubPerAccountState } from '../reduxTypes';
import { createStyleSheet } from '../styles';
import { connectGlobal } from '../react-redux';
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

  // from `connectGlobal`
  dispatch: GlobalDispatch,
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

    dispatch(
      appOnline(
        // From reading code at @react-native-community/net-info v6.0.0 (the
        // docs and types don't really give these answers):
        //
        // This will be `null` on both platforms while the first known value
        // of `true` or `false` is being shipped across the asynchronous RN
        // bridge.
        //
        // On Android, it shouldn't otherwise be `null`. The value is set to the
        // result of an Android function that only returns a boolean:
        // https://developer.android.com/reference/android/net/NetworkInfo#isConnected()
        //
        // On iOS, this can also be `null` while the app asynchronously
        // evaluates whether a network change should cause this to go from
        // `false` to `true`. Read on for details (gathered from
        // src/internal/internetReachability.ts in the library).
        //
        // 1. A request loop is started. A HEAD request is made to
        //    https://clients3.google.com/generate_204, with a timeout of
        //    15s (`reachabilityRequestTimeout`), to see if the Internet is
        //    reachable.
        //    - If the `fetch` succeeds and a 204 is received, this will be
        //      made `true`. We'll then sleep for 60s before making the
        //      request again.
        //    - If the `fetch` succeeds and a 204 is not received, or if the
        //      fetch fails, or if the timeout expires, this will be made
        //      `false`. We'll then sleep for only 5s before making the
        //      request again.
        // 2. The request loop is interrupted if we get a
        //    'netInfo.networkStatusDidChange' event from the library's
        //    native code, signaling a change in the network state. If that
        //    change would make `netInfoState.type` become or remain
        //    something good (i.e., not 'none' or 'unknown'), and this
        //    (`.isInternetReachable`) is currently `false`, then this will
        //    be made `null`, and the request loop described above will
        //    start again.
        //
        // (Several of those parameters are configurable -- timeout durations,
        // URL, etc.)
        netInfoState.isInternetReachable,
      ),
    );
  };

  /** For the type, see docs: https://reactnative.dev/docs/appstate */
  handleAppStateChange = (state: 'active' | 'background' | 'inactive') => {
    const { unreadCount } = this.props;
    if (state === 'background' && Platform.OS === 'android') {
      NativeModules.BadgeCountUpdaterModule.setBadgeCount(unreadCount);
    }
  };

  notificationListener = new NotificationListener(this.props.dispatch);
  shareListener = new ShareReceivedListener();

  handleMemoryWarning = () => {
    // Release memory here
  };

  componentDidMount() {
    const { dispatch } = this.props;
    handleInitialNotification(dispatch);
    handleInitialShare();

    NetInfo.configure({
      // This is the default, as of 6.0.0, but `OfflineNotice` depends on this
      // value being stable.
      reachabilityRequestTimeout: 15 * 1000,
    });
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

const AppEventHandlers: ComponentType<OuterProps> = connectGlobal(state => ({
  // TODO(#5006): The use of this per-account state in this global component
  //   highlights how this feature (a badge count based on unreads, on
  //   Android only) is pretty broken if you use multiple accounts -- it
  //   reflects only the one last account you used.  Maybe just cut it?
  unreadCount: getUnreadByHuddlesMentionsAndPMs(dubPerAccountState(state)),
}))(AppEventHandlersInner);

export default AppEventHandlers;
