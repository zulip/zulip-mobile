/* @flow strict-local */
import React, { useState, useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Auth, Dispatch, Stream, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { navigateBack } from '../actions';
import * as api from '../api';
import { getAuth, getStreamForId } from '../selectors';
import UserPickerCard from '../user-picker/UserPickerCard';

type SelectorProps = $ReadOnly<{|
  auth: Auth,
  stream: Stream,
|}>;

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'invite-users'>,
  route: RouteProp<'invite-users', {| streamId: number |}>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

function InviteUsersScreen(props: Props) {
  const { auth, stream } = props;

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

export default connect<SelectorProps, _, _>((state, props) => ({
  auth: getAuth(state),
  stream: getStreamForId(state, props.route.params.streamId),
}))(InviteUsersScreen);
