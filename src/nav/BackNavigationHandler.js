/* @flow strict-local */
import type { Node as React$Node } from 'react';

import { PureComponent } from 'react';
import { BackHandler } from 'react-native';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { navigateBack } from '../actions';

type Props = $ReadOnly<{|
  children: React$Node,
  canGoBack: boolean,
  dispatch: Dispatch,
|}>;

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
  canGoBack: state.nav.index > 0,
}))(BackNavigationHandler);
