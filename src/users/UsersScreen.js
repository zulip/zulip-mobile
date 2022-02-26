/* @flow strict-local */
import React, { useState } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';
import UsersCard from './UsersCard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'users'>,
  route: RouteProp<'users', void>,
|}>;

export default function UsersScreen(props: Props): Node {
  const [filter, setFilter] = useState<string>('');

  return (
    <Screen search autoFocus scrollEnabled={false} searchBarOnChange={setFilter}>
      <UsersCard filter={filter} />
    </Screen>
  );
}
