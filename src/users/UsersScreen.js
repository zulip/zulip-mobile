/* @flow strict-local */
import React, { useState } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { Screen } from '../common';
import UsersCard from './UsersCard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'users'>,
  route: RouteProp<'users', void>,
|}>;

/**
 * A screen for a searchable list of users.
 *
 * Covers the horizontal insets because its descendents (the user items
 * and section headers) need to.
 */
export default function UsersScreen(props: Props): Node {
  const [filter, setFilter] = useState<string>('');

  return (
    <Screen search autoFocus scrollEnabled={false} searchBarOnChange={setFilter}>
      <UsersCard filter={filter} />
    </Screen>
  );
}
