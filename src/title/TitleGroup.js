/* @flow strict-local */

import React from 'react';
import { ScrollView, View } from 'react-native';

import { useSelector } from '../react-redux';
import { getMutedUsers } from '../selectors';
import type { UserId } from '../types';
import * as NavigationService from '../nav/NavigationService';
import { createStyleSheet } from '../styles';
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
  const mutedUsers = useSelector(getMutedUsers);

  return (
    /* fadingEdgeLength is an android-only prop used to fade the edges so that they don't end abruptly */
    <ScrollView horizontal showsHorizontalScrollIndicator={false} fadingEdgeLength={50}>
      {userIds.map(userId => (
        <View key={userId} style={componentStyles.titleAvatar}>
          <UserAvatarWithPresenceById
            onPress={() => {
              NavigationService.dispatch(navigateToAccountDetails(userId));
            }}
            size={32}
            userId={userId}
            isMuted={mutedUsers.has(userId)}
          />
        </View>
      ))}
    </ScrollView>
  );
}
