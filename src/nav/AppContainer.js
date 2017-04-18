/* @flow */
import React from 'react';
import { AppState, NetInfo, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import AppWithNavigationState from './AppWithNavigationState';
import { getAuth } from '../account/accountSelectors';
import { registerAppActivity } from '../utils/activity';
import { checkCompatibility } from '../api';
import CompatibilityScreen from '../start/CompatibilityScreen';

class AppContainer extends React.PureComponent {
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
    const { actions } = this.props;
    actions.resetNavigation();
    NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);
    // check with server if current mobile app is compatible with latest backend
    // compatibility fails only if server responds with 400 (but not with 200 or 404)
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
    const { needsInitialFetch, actions, pushToken } = props;

    if (needsInitialFetch) {
      actions.fetchEssentialInitialData();
      actions.fetchRestOfInitialData(pushToken);
      actions.fetchEvents();
    }
  };

  render() {
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
    locale: state.settings.locale,
    needsInitialFetch: state.app.needsInitialFetch,
    accounts: state.accounts,
    pushToken: state.realm.pushToken,
  }),
  boundActions,
)(AppContainer);
