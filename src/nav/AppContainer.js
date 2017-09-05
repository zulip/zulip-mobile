/* @flow */
import React, { PureComponent } from 'react';
import { AppState, BackHandler, NetInfo, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import AppWithNavigationState from './AppWithNavigationState';
import { getAuth, getNavigationIndex } from '../selectors';
import { registerAppActivity } from '../utils/activity';
import { checkCompatibility } from '../api';
import CompatibilityScreen from '../start/CompatibilityScreen';
import { Auth, Actions } from '../types';

type Props = {
  auth: Auth,
  needsInitialFetch: boolean,
  actions: Actions,
};

class AppContainer extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };
  props: Props;

  state = {
    compatibilityCheckFail: false,
  };

  handleLayout = event => {
    const { actions } = this.props;
    const { width, height } = event.nativeEvent.layout;
    const orientation = width > height ? 'LANDSCAPE' : 'PORTRAIT';
    actions.appOrientation(orientation);
  };

  handleConnectivityChange = isConnected => {
    const { actions, needsInitialFetch } = this.props;
    actions.appOnline(isConnected);
    if (!needsInitialFetch && isConnected) {
      actions.trySendMessages();
    }
  };

  handleAppStateChange = state => {
    const { auth, actions } = this.props;
    registerAppActivity(auth, state === 'active');
    actions.appState(state === 'active');
  };

  handleBackButtonPress = () => {
    const { navIndex, actions } = this.props;
    if (navIndex !== 0) {
      actions.navigateBack();
      return true;
    }
    return false;
  }

  handleMemoryWarning = () => {
    // Release memory here
  };

  componentDidMount() {
    NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
    AppState.addEventListener('change', this.handleAppStateChange);
    AppState.addEventListener('memoryWarning', this.handleMemoryWarning);
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
    checkCompatibility().then(res => {
      if (res.status === 400) {
        this.setState({
          compatibilityCheckFail: true,
        });
      }
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
    const { actions, needsInitialFetch } = props;

    if (needsInitialFetch) {
      actions.doInitialFetch();
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
    needsInitialFetch: state.app.needsInitialFetch,
    navIndex: getNavigationIndex(state),
  }),
  boundActions,
)(AppContainer);
