/* @flow */
import React, { PureComponent } from 'react';
import { AppState, NetInfo, View } from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';

import boundActions from '../boundActions';
import AppWithNavigationState from './AppWithNavigationState';
import { getAuth } from '../selectors';
import { registerAppActivity } from '../utils/activity';
import { checkCompatibility } from '../api';
import LoadingScreen from '../start/LoadingScreen';
import CompatibilityScreen from '../start/CompatibilityScreen';

class AppContainer extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  state = {
    compatibilityCheckFail: false,
  };

  handleLayout = event => {
    const { width, height } = event.nativeEvent.layout;
    const orientation = width > height ? 'LANDSCAPE' : 'PORTRAIT';
    this.props.actions.appOrientation(orientation);
  };

  handleConnectivityChange = isConnected => this.props.actions.appOnline(isConnected);

  handleAppStateChange = state => {
    const { auth, actions } = this.props;
    registerAppActivity(auth, state === 'active');
    actions.appState(state === 'active');
  };

  handleMemoryWarning = () => {
    // Release memory here
  };

  componentDidMount() {
    NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);
    checkCompatibility().then(res => {
      this.setState({
        compatibilityCheckFail: res.status === 400,
      });
    });
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('change', this.handleConnectivityChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);
  }

  componentWillMount = () => this.init(this.props);

  componentWillReceiveProps = nextProps => this.init(nextProps);

  init = props => {
    const { needsInitialFetch, actions } = props;

    if (needsInitialFetch) {
      actions.fetchEssentialInitialData();
      actions.fetchRestOfInitialData();
      actions.fetchEvents();
      if (!DeviceInfo.isEmulator()) {
        actions.initNotifications();
      }
    }
  };

  render() {
    const { isHydrated } = this.props;

    if (!isHydrated) {
      return <LoadingScreen />;
    }

    const { compatibilityCheckFail } = this.state;

    if (compatibilityCheckFail) {
      return <CompatibilityScreen />;
    }

    return (
      <View style={this.context.styles.screen} onLayout={this.handleLayout}>
        <AppWithNavigationState />
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
    isHydrated: state.app.isHydrated,
    needsInitialFetch: state.app.needsInitialFetch,
  }),
  boundActions,
)(AppContainer);
