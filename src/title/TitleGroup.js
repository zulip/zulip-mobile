/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { useSelector } from '../react-redux';
import { getMutedUsers, getOwnUserId } from '../selectors';
import { pmUiRecipientsFromKeyRecipients, type PmKeyRecipients } from '../utils/recipient';
import styles, { createStyleSheet } from '../styles';
import { UserAvatarWithPresenceById } from '../common/UserAvatarWithPresence';
import { navigateToAccountDetails } from '../nav/navActions';
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
  const mutedUsers = useSelector(getMutedUsers);
  const ownUserId = useSelector(getOwnUserId);
  const userIds = pmUiRecipientsFromKeyRecipients(recipients, ownUserId);
  const navigation = useNavigation();

  return (
    <View style={styles.navWrapper}>
      {userIds.map(userId => (
        <View key={userId} style={componentStyles.titleAvatar}>
          <UserAvatarWithPresenceById
            onPress={() => {
              navigation.dispatch(navigateToAccountDetails(userId));
            }}
            size={32}
            userId={userId}
            isMuted={mutedUsers.has(userId)}
          />
        </View>
      ))}
    </View>
  );
}
