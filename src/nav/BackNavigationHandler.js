/* @flow strict-local */
import type { Node as React$Node } from 'react';
import { PureComponent } from 'react';
import { BackHandler } from 'react-native';

import NavigationService from './NavigationService';
import { navigateBack } from '../actions';

type Props = $ReadOnly<{|
  children: React$Node,
|}>;

export default class BackNavigationHandler extends PureComponent<Props> {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  handleBackButtonPress = () => {
    const canGoBack = NavigationService.getState().index > 0;
    if (canGoBack) {
      NavigationService.dispatch(navigateBack());
    }
    return canGoBack;
  };

  render() {
    return this.props.children;
  }
}
