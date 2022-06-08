/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector } from '../react-redux';
import type { UserOrBot } from '../types';
import { pmUiRecipientsFromKeyRecipients, type PmKeyRecipients } from '../utils/recipient';
import Screen from '../common/Screen';
import UserItem from '../users/UserItem';
import { getOwnUserId } from '../selectors';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'pm-conversation-details'>,
  route: RouteProp<'pm-conversation-details', {| recipients: PmKeyRecipients |}>,
|}>;

export default function PmConversationDetailsScreen(props: Props): Node {
  const { navigation } = props;
  const { recipients } = props.route.params;
  const ownUserId = useSelector(getOwnUserId);

  const handlePress = useCallback(
    (user: UserOrBot) => {
      navigation.push('account-details', { userId: user.user_id });
    },
    [navigation],
  );

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
