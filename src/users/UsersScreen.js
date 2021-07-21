/* @flow strict-local */
import React, { useState, useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { Screen } from '../common';
import UsersCard from './UsersCard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'users'>,
  route: RouteProp<'users', void>,
|}>;

export default function UsersScreen(props: Props) {
  const [filter, setFilter] = useState<string>('');

  const handleFilterChange = useCallback((_filter: string) => setFilter(_filter), []);

  return (
    <Screen search autoFocus scrollEnabled={false} searchBarOnChange={handleFilterChange}>
      <UsersCard filter={filter} />
    </Screen>
  );
}
