/* @flow strict-local */

import React, { PureComponent } from 'react';

import NavigationService from '../nav/NavigationService';
import type { Dispatch, Narrow } from '../types';
import { connect } from '../react-redux';
import NavButton from '../nav/NavButton';
import { navigateToAccountDetails } from '../actions';
import { getUserForEmail } from '../users/userSelectors';
import { emailOfPm1to1Narrow } from '../utils/narrow';

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
    const { userId } = this.props;
    NavigationService.dispatch(navigateToAccountDetails(userId));
  };

  render() {
    const { color } = this.props;

    return <NavButton name="info" color={color} onPress={this.handlePress} />;
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  userId: getUserForEmail(state, emailOfPm1to1Narrow(props.narrow)).user_id,
}))(InfoNavButtonPrivate);
