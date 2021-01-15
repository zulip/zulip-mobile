/* @flow strict-local */
import React, { PureComponent } from 'react';

import * as NavigationService from '../nav/NavigationService';
import NavButton from '../nav/NavButton';
import { navigateToAccountDetails } from '../actions';

type Props = $ReadOnly<{|
  color: string,
  userId: number,
|}>;

export default class InfoNavButtonPrivate extends PureComponent<Props> {
  render() {
    const { color } = this.props;
    return (
      <NavButton
        name="info"
        color={color}
        onPress={() => {
          const { userId } = this.props;
          NavigationService.dispatch(navigateToAccountDetails(userId));
        }}
      />
    );
  }
}
