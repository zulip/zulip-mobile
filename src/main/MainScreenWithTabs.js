/* @flow */
import React, { PureComponent } from 'react';
import { BackHandler, View } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { ZulipStatusBar } from '../common';
import { getCanGoBack } from '../selectors';
import MainTabs from './MainTabs';

type Props = {
  actions: Actions,
  canGoBack: boolean,
};

class MainScreenWithTabs extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

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
    const { styles } = this.context;
    const { canGoBack, actions } = this.props;

    return (
      <View style={[styles.flexed, styles.backgroundColor]}>
        <ZulipStatusBar canGoBack={canGoBack} actions={actions} />
        <MainTabs canGoBack={canGoBack} actions={actions} />
      </View>
    );
  }
}

export default connectWithActions(state => ({
  canGoBack: getCanGoBack(state),
}))(MainScreenWithTabs);
