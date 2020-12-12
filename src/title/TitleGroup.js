/* @flow strict-local */

import React from 'react';
import { View } from 'react-native';

import type { UserId } from '../types';
import * as NavigationService from '../nav/NavigationService';
import styles, { createStyleSheet } from '../styles';
import { UserAvatarWithPresenceById } from '../common/UserAvatarWithPresence';
import { navigateToAccountDetails } from '../nav/navActions';

type Props = $ReadOnly<{|
  userIds: $ReadOnlyArray<UserId>,
|}>;

const componentStyles = createStyleSheet({
  titleAvatar: {
    marginRight: 16,
  },
});

export default function TitleGroup(props: Props) {
  const { userIds } = props;
  return (
    <View style={styles.navWrapper}>
      {userIds.map(userId => (
        <View key={userId} style={componentStyles.titleAvatar}>
          <UserAvatarWithPresenceById
            onPress={() => {
              NavigationService.dispatch(navigateToAccountDetails(userId));
            }}
            size={32}
            userId={userId}
          />
        </View>
      ))}
    </View>
  );
}
