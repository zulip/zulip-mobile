/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch, Narrow } from '../types';
import NavButton from '../nav/NavButton';
import { navigateToAccountDetails } from '../actions';

type Props = {
  dispatch: Dispatch,
  narrow: Narrow,
  color: string,
};

class InfoNavButtonPrivate extends PureComponent<Props> {
  props: Props;

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
