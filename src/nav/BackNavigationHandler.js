/* @flow strict-local */
import { PureComponent } from 'react';
import type { Node } from 'react';
import { BackHandler } from 'react-native';

import * as NavigationService from './NavigationService';
import { navigateBack } from '../actions';

type Props = $ReadOnly<{|
  children: Node,
|}>;

export default class BackNavigationHandler extends PureComponent<Props> {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  handleBackButtonPress: () => boolean = () => {
    const canGoBack = NavigationService.getState().index > 0;
    if (canGoBack) {
      NavigationService.dispatch(
        // Our custom "go-back" action. If this is changed to align
        // with React Navigation's natural "go-back" behavior, this
        // whole component can go away.
        navigateBack(),
      );
    }
    return canGoBack;
  };

  render(): Node {
    return this.props.children;
  }
}
