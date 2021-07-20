/* @flow strict-local */
import React, { useState, useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, UserId, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { doNarrow, navigateBack } from '../actions';
import { pmNarrowFromUsers } from '../utils/narrow';
import { pmKeyRecipientsFromUsers } from '../utils/recipient';
import UserPickerCard from '../user-picker/UserPickerCard';
import { getOwnUserId } from '../users/userSelectors';

type SelectorProps = {|
  +ownUserId: UserId,
|};

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'create-group'>,
  route: RouteProp<'create-group', void>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

function CreateGroupScreen(props: Props) {
  const { dispatch, ownUserId } = props;

  const [filter, setFilter] = useState<string>('');

  const handleFilterChange = useCallback((_filter: string) => setFilter(_filter), []);

  const handleCreateGroup = useCallback(
    (selected: UserOrBot[]) => {
      NavigationService.dispatch(navigateBack());
      dispatch(doNarrow(pmNarrowFromUsers(pmKeyRecipientsFromUsers(selected, ownUserId))));
    },
    [dispatch, ownUserId],
  );

  return (
    <Screen search scrollEnabled={false} searchBarOnChange={handleFilterChange}>
      <UserPickerCard filter={filter} onComplete={handleCreateGroup} />
    </Screen>
  );
}

export default connect<SelectorProps, _, _>(state => ({
  ownUserId: getOwnUserId(state),
}))(CreateGroupScreen);
