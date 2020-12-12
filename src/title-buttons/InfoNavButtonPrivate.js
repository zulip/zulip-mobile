/* @flow strict-local */
import React, { PureComponent } from 'react';

import NavigationService from '../nav/NavigationService';
import NavButton from '../nav/NavButton';
import { navigateToAccountDetails } from '../actions';

type Props = $ReadOnly<{|
  color: string,
  userId: number,
|}>;

export default class InfoNavButtonPrivate extends PureComponent<Props> {
  handlePress = () => {
    const { userId } = this.props;
    NavigationService.dispatch(navigateToAccountDetails(userId));
  };

  render() {
    const { color } = this.props;
    return <NavButton name="info" color={color} onPress={this.handlePress} />;
  }
}
