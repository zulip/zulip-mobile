/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import { useSelector } from '../react-redux';
import type { UserOrBot } from '../types';
import { pmUiRecipientsFromKeyRecipients, type PmKeyRecipients } from '../utils/recipient';
import { Screen } from '../common';
import UserItem from '../users/UserItem';
import { navigateToAccountDetails } from '../actions';
import { getOwnUserId } from '../selectors';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'group-details'>,
  route: RouteProp<'group-details', {| recipients: PmKeyRecipients |}>,
|}>;

export default function GroupDetailsScreen(props: Props): Node {
  const { recipients } = props.route.params;
  const ownUserId = useSelector(getOwnUserId);

  const handlePress = useCallback((user: UserOrBot) => {
    NavigationService.dispatch(navigateToAccountDetails(user.user_id));
  }, []);

  return (
    <Screen title="Recipients" scrollEnabled={false}>
      <FlatList
        initialNumToRender={10}
        data={pmUiRecipientsFromKeyRecipients(recipients, ownUserId)}
        keyExtractor={item => String(item)}
        renderItem={({ item }) => (
          <UserItem key={item} userId={item} showEmail onPress={handlePress} />
        )}
      />
    </Screen>
  );
}
