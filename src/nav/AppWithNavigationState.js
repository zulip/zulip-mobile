/* @noflow */
import React, { PureComponent } from 'react';
import { BackHandler } from 'react-native';
import { addNavigationHelpers } from 'react-navigation';

import connectWithActions from '../connectWithActions';
import { getCanGoBack } from '../selectors';
import AppNavigator from './AppNavigator';

type Props = {
  canGoBack: boolean,
};

class AppWithNavigation extends PureComponent<Props> {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  handleBackButtonPress = () => {
    const { canGoBack, actions } = this.props;
    if (canGoBack) {
      actions.navigateBack();
    }
    return canGoBack;
  };

  render() {
    const { dispatch, nav } = this.props;

    return (
      <AppNavigator
        navigation={addNavigationHelpers({
          state: nav,
          dispatch,
        })}
      />
    );
  }
}

export default connectWithActions(state => ({
  nav: state.nav,
  canGoBack: getCanGoBack(state),
}))(AppWithNavigation);
