/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node, ComponentType } from 'react';
import { AppState, View } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

import type { GlobalDispatch, Orientation as OrientationT } from '../types';
import { createStyleSheet } from '../styles';
import { connectGlobal } from '../react-redux';
import { handleInitialNotification } from '../notification/notifOpen';
import NotificationListener from '../notification/NotificationListener';
import { ShareReceivedListener, handleInitialShare } from '../sharing';
import { appOrientation } from '../actions';
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

type SelectorProps = $ReadOnly<{||}>;

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
  handleOrientationChange = (event: ScreenOrientation.OrientationChangeEvent) => {
    const { dispatch } = this.props;

    const { orientation } = event.orientationInfo;

    dispatch(appOrientation(orientationLookup[orientation]));
  };

  notificationListener = new NotificationListener(this.props.dispatch);
  shareListener = new ShareReceivedListener();

  handleMemoryWarning = () => {
    // Release memory here
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(handleInitialNotification());
    handleInitialShare();

    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);

    // The listener doesn't seem to fire in RN's "Debug with Chrome" mode.
    ScreenOrientation.addOrientationChangeListener(this.handleOrientationChange);

    this.notificationListener.start();
    this.shareListener.start();
  }

  componentWillUnmount() {
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

const AppEventHandlers: ComponentType<OuterProps> = connectGlobal()(AppEventHandlersInner);

export default AppEventHandlers;
