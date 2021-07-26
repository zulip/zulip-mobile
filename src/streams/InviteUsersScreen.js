/* @flow strict-local */
import React, { useState, useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { UserOrBot } from '../types';
import { useSelector } from '../react-redux';
import { Screen } from '../common';
import { navigateBack } from '../actions';
import * as api from '../api';
import { getAuth, getStreamForId } from '../selectors';
import UserPickerCard from '../user-picker/UserPickerCard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'invite-users'>,
  route: RouteProp<'invite-users', {| streamId: number |}>,
|}>;

export default function InviteUsersScreen(props: Props) {
  const auth = useSelector(getAuth);
  const stream = useSelector(state => getStreamForId(state, props.route.params.streamId));

  const [filter, setFilter] = useState<string>('');

  const handleFilterChange = useCallback((_filter: string) => setFilter(_filter), []);

  const handleInviteUsers = useCallback(
    (selected: UserOrBot[]) => {
      const recipients = selected.map(user => user.email);
      api.subscriptionAdd(auth, [{ name: stream.name }], recipients);
      NavigationService.dispatch(navigateBack());
    },
    [auth, stream],
  );

  return (
    <Screen search scrollEnabled={false} searchBarOnChange={handleFilterChange}>
      <UserPickerCard filter={filter} onComplete={handleInviteUsers} />
    </Screen>
  );
}
