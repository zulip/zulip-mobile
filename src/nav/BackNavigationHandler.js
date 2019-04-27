/* @flow strict-local */
import type { Node as React$Node } from 'react';

import { PureComponent } from 'react';
import { BackHandler } from 'react-native';

import type { InjectedDispatch } from '../types';
import { connect } from '../react-redux';
import { getCanGoBack } from '../selectors';
import { navigateBack } from '../actions';

type OwnProps = {|
  children: React$Node,
|};

type SelectorProps = {|
  canGoBack: boolean,
|};

type Props = {|
  ...InjectedDispatch,
  ...OwnProps,
  ...SelectorProps,
|};

class BackNavigationHandler extends PureComponent<Props> {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  handleBackButtonPress = () => {
    const { canGoBack, dispatch } = this.props;
    if (canGoBack) {
      dispatch(navigateBack());
    }
    return canGoBack;
  };

  render() {
    return this.props.children;
  }
}

export default connect(state => ({
  canGoBack: getCanGoBack(state),
}))(BackNavigationHandler);
