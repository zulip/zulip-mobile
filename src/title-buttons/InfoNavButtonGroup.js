/* @flow strict-local */

import React, { PureComponent } from 'react';

import * as NavigationService from '../nav/NavigationService';
import NavButton from '../nav/NavButton';
import { navigateToGroupDetails } from '../actions';

type Props = $ReadOnly<{|
  color: string,
  userIds: $ReadOnlyArray<number>,
|}>;

export default class InfoNavButtonGroup extends PureComponent<Props> {
  render() {
    const { color } = this.props;

    return (
      <NavButton
        name="info"
        color={color}
        onPress={() => {
          const { userIds } = this.props;
          NavigationService.dispatch(navigateToGroupDetails(userIds));
        }}
      />
    );
  }
}
