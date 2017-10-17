/* @flow */
import React, { PureComponent } from 'react';
import { AppState, BackHandler, NetInfo, View, Platform } from 'react-native';
import SafeArea from 'react-native-safe-area';
import Orientation from 'react-native-orientation';

import type { Auth, Actions, ChildrenArray } from '../types';
import connectWithActions from '../connectWithActions';
import { getAuth, getNavigationIndex } from '../selectors';
import { registerAppActivity } from '../utils/activity';
import { handlePendingNotifications } from '../utils/notifications';

type Props = {
  auth: Auth,
  navIndex: number,
  needsInitialFetch: boolean,
  actions: Actions,
  children?: ChildrenArray<*>,
};

class AppEventHandlers extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };
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
    const { auth, actions, needsInitialFetch } = this.props;
    registerAppActivity(auth, state === 'active');
    actions.appState(state === 'active');
    if (
      state === 'active' &&
      Platform.OS === 'android' &&
      !needsInitialFetch &&
      auth.realm !== ''
    ) {
      handlePendingNotifications(actions.doNarrow);
    }
  };

  handleBackButtonPress = () => {
    const { navIndex, actions } = this.props;
    if (navIndex !== 0) {
      actions.navigateBack();
      return true;
    }
    return false;
  };

  handleMemoryWarning = () => {
    // Release memory here
  };

  componentDidMount() {
    const { actions } = this.props;

    NetInfo.addEventListener('connectionChange', this.handleConnectivityChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
    SafeArea.getSafeAreaInsetsForRootView().then(actions.initSafeAreaInsets);
    Orientation.addOrientationListener(this.handleOrientationChange);
  }

  componentWillUnmount() {
    NetInfo.removeEventListener('connectionChange', this.handleConnectivityChange);
    AppState.removeEventListener('change', this.handleAppStateChange);
    AppState.removeEventListener('memoryWarning', this.handleMemoryWarning);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
    Orientation.removeOrientationListener(this.handleOrientationChange);
  }

  render() {
    return <View style={this.context.styles.screen}>{this.props.children}</View>;
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  needsInitialFetch: state.app.needsInitialFetch,
  navIndex: getNavigationIndex(state),
}))(AppEventHandlers);
