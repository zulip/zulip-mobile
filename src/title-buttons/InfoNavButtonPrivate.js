/* @flow strict-local */
import React from 'react';

import type { UserId } from '../types';
import * as NavigationService from '../nav/NavigationService';
import NavButton from '../nav/NavButton';
import { navigateToAccountDetails } from '../actions';

type Props = $ReadOnly<{|
  color: string,
  userId: UserId,
|}>;

export default function InfoNavButtonPrivate(props: Props) {
  const { color } = props;
  return (
    <NavButton
      name="info"
      color={color}
      onPress={() => {
        const { userId } = props;
        NavigationService.dispatch(navigateToAccountDetails(userId));
      }}
    />
  );
}
