/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { useSelector } from '../react-redux';
import { getOwnUserId } from '../selectors';
import { pmUiRecipientsFromKeyRecipients, type PmKeyRecipients } from '../utils/recipient';
import styles, { createStyleSheet } from '../styles';
import UserAvatarWithPresence from '../common/UserAvatarWithPresence';
import { useNavigation } from '../react-navigation';

type Props = $ReadOnly<{|
  recipients: PmKeyRecipients,
|}>;

const componentStyles = createStyleSheet({
  titleAvatar: {
    marginRight: 16,
  },
});

export default function TitleGroup(props: Props): Node {
  const { recipients } = props;
  const ownUserId = useSelector(getOwnUserId);
  const userIds = pmUiRecipientsFromKeyRecipients(recipients, ownUserId);
  const navigation = useNavigation();

  return (
    <View style={styles.navWrapper}>
      {userIds.map(userId => (
        <View key={userId} style={componentStyles.titleAvatar}>
          <UserAvatarWithPresence
            onPress={() => {
              navigation.push('account-details', { userId });
            }}
            size={32}
            userId={userId}
          />
        </View>
      ))}
    </View>
  );
}
