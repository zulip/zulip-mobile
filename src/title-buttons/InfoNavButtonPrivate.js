/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { Dispatch, Narrow } from '../types';
import { connect } from '../react-redux';
import NavButton from '../nav/NavButton';
import { navigateToAccountDetails } from '../actions';
import { getUserForEmail } from '../users/userSelectors';

type SelectorProps = $ReadOnly<{|
  userId: number,
|}>;

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  narrow: Narrow,
  color: string,
  ...SelectorProps,
|}>;

class InfoNavButtonPrivate extends PureComponent<Props> {
  handlePress = () => {
    const { dispatch, userId } = this.props;
    dispatch(navigateToAccountDetails(userId));
  };

  render() {
    const { color } = this.props;

    return <NavButton name="info" color={color} onPress={this.handlePress} />;
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  userId: getUserForEmail(state, props.narrow[0].operand).user_id,
}))(InfoNavButtonPrivate);
