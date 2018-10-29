/* @flow */
import React, { PureComponent } from 'react';
import { Platform } from 'react-native';
import { connect } from 'react-redux';

import type { Dispatch } from '../types';
import { navigateBack } from '../actions';
import { getCanGoBack } from '../selectors';
import { connectPreserveOnBackOption } from '../utils/redux';
import NavButton from './NavButton';

type Props = {
  dispatch: Dispatch,
  canGoBack: boolean,
  color: string,
};

class BackButton extends PureComponent<Props> {
  props: Props;

  render() {
    const { canGoBack, color, dispatch } = this.props;

    if (!canGoBack) {
      return null;
    }

    const accessibilityLabel = Platform.OS === 'ios' ? 'Back button' : 'Navigate up button';

    return (
      <NavButton
        accessibilityLabel={accessibilityLabel}
        name="arrow-left"
        color={color}
        onPress={() => {
          dispatch(navigateBack());
        }}
      />
    );
  }
}

export default connect(
  state => ({
    canGoBack: getCanGoBack(state),
  }),
  null,
  null,
  connectPreserveOnBackOption,
)(BackButton);
