/* @flow */
import React from 'react';
import { AppState, NetInfo, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { registerAppActivity } from '../utils/activity';
import { checkCompatibility } from '../api';
import { getInitialRoutes } from './routingSelectors';
import Navigation from './Navigation';

class NavigationContainer extends React.PureComponent {

  static contextTypes = {
    styles: () => null,
  };

  state = {
    compatibilityCheckFail: false,
  };

  handleLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    const orientation = (width > height) ? 'LANDSCAPE' : 'PORTRAIT';
    this.props.actions.appOrientation(orientation);
  }

  handleConnectivityChange = (isConnected) =>
    this.props.actions.appOnline(isConnected);

  handleAppStateChange = (state) => {
    const { auth, actions } = this.props;
    registerAppActivity(auth, state === 'active');
    actions.appState(state === 'active');
  }

  handleMemoryWarning = () => {
    // Release memory here
  }

  componentDidMount() {
    const { accounts, actions } = this.props;
    actions.initRoutes(getInitialRoutes(accounts));
    NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);
    // check with server if current mobile app is compatible with latest backend
    // compatibility fails only if server responds with 400 (but not with 200 or 404)
    checkCompatibility().then(res =>
      this.setState({ compatibilityCheckFail: res.status === 400 })
    );
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('change', this.handleConnectivityChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);
  }

  componentWillReceiveProps(nextProps) {
    const { needsInitialFetch, actions, pushToken } = nextProps;
    if (needsInitialFetch) {
      actions.fetchEssentialInitialData();
      actions.fetchRestOfInitialData(pushToken);
      actions.fetchEvents();
    }
  }

  render() {
    return (
      <View style={this.context.styles.screen} onLayout={this.handleLayout}>
        <Navigation
          {...this.props}
          compatibilityCheckFail={this.state.compatibilityCheckFail}
        />
      </View>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    locale: state.settings.locale,
    needsInitialFetch: state.app.needsInitialFetch,
    accounts: state.accounts,
    navigation: state.nav,
    pushToken: state.realm.pushToken,
  }),
  boundActions,
)(NavigationContainer);
