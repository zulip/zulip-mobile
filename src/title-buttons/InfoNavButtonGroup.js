/* @flow strict-local */
import React from 'react';

import type { UserId } from '../types';
import * as NavigationService from '../nav/NavigationService';
import NavButton from '../nav/NavButton';
import { navigateToGroupDetails } from '../actions';

type Props = $ReadOnly<{|
  color: string,
  userIds: $ReadOnlyArray<UserId>,
|}>;

export default function InfoNavButtonGroup(props: Props) {
  const { color } = props;

  return (
    <NavButton
      name="info"
      color={color}
      onPress={() => {
        const { userIds } = props;
        NavigationService.dispatch(navigateToGroupDetails(userIds));
      }}
    />
  );
}
