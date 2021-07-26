/* @flow strict-local */
import React, { useState, useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { UserOrBot } from '../types';
import { useSelector, useDispatch } from '../react-redux';
import { Screen } from '../common';
import { doNarrow, navigateBack } from '../actions';
import { pmNarrowFromUsers } from '../utils/narrow';
import { pmKeyRecipientsFromUsers } from '../utils/recipient';
import UserPickerCard from '../user-picker/UserPickerCard';
import { getOwnUserId } from '../users/userSelectors';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'create-group'>,
  route: RouteProp<'create-group', void>,
|}>;

export default function CreateGroupScreen(props: Props) {
  const dispatch = useDispatch();
  const ownUserId = useSelector(getOwnUserId);

  const [filter, setFilter] = useState<string>('');

  const handleCreateGroup = useCallback(
    (selected: UserOrBot[]) => {
      NavigationService.dispatch(navigateBack());
      dispatch(doNarrow(pmNarrowFromUsers(pmKeyRecipientsFromUsers(selected, ownUserId))));
    },
    [dispatch, ownUserId],
  );

  return (
    <Screen search scrollEnabled={false} searchBarOnChange={setFilter}>
      <UserPickerCard filter={filter} onComplete={handleCreateGroup} />
    </Screen>
  );
}
