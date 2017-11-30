/* @noflow */
import React, { PureComponent } from 'react';
import { BackHandler } from 'react-native';
import { addNavigationHelpers } from 'react-navigation';

import connectWithActions from '../connectWithActions';
import { getCanGoBack } from '../selectors';
import AppNavigator from './AppNavigator';
import { navigateBackFromNarrow } from '../utils/narrow';

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
    const { canGoBack, actions, nav } = this.props;
    if (canGoBack) {
      if (!(nav.index > 0)) {
        actions.doNarrow(navigateBackFromNarrow());
      } else {
        actions.navigateBack();
      }
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
