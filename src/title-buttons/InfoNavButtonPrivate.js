/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { InjectedDispatch, Narrow } from '../types';
import { connect } from '../react-redux';
import NavButton from '../nav/NavButton';
import { navigateToAccountDetails } from '../actions';

type Props = {|
  ...InjectedDispatch,
  narrow: Narrow,
  color: string,
|};

class InfoNavButtonPrivate extends PureComponent<Props> {
  handlePress = () => {
    const { dispatch, narrow } = this.props;
    dispatch(navigateToAccountDetails(narrow[0].operand));
  };

  render() {
    const { color } = this.props;

    return <NavButton name="info" color={color} onPress={this.handlePress} />;
  }
}

export default connect()(InfoNavButtonPrivate);
