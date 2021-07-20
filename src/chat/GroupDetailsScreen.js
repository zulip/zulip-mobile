/* @flow strict-local */
import React, { useCallback } from 'react';
import { FlatList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, UserOrBot, UserId } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import UserItem from '../users/UserItem';
import { navigateToAccountDetails } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'group-details'>,
  route: RouteProp<'group-details', {| recipients: $ReadOnlyArray<UserId> |}>,

  dispatch: Dispatch,
|}>;

function GroupDetailsScreen(props: Props) {
  const { recipients } = props.route.params;
  const handlePress = useCallback((user: UserOrBot) => {
    NavigationService.dispatch(navigateToAccountDetails(user.user_id));
  }, []);

  return (
    <Screen title="Recipients" scrollEnabled={false}>
      <FlatList
        initialNumToRender={10}
        data={recipients}
        keyExtractor={item => String(item)}
        renderItem={({ item }) => (
          <UserItem key={item} userId={item} showEmail onPress={handlePress} />
        )}
      />
    </Screen>
  );
}

export default connect<{||}, _, _>()(GroupDetailsScreen);
