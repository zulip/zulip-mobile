/* @flow strict-local */

import React from 'react';
import { Text, View } from 'react-native';

import * as NavigationService from '../nav/NavigationService';
import styles, { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { Touchable, ViewPlaceholder } from '../common';
import { UserAvatarWithPresenceById } from '../common/UserAvatarWithPresence';
import ActivityText from './ActivityText';
import { getAllUsersById } from '../users/userSelectors';
import { navigateToAccountDetails } from '../nav/navActions';

type Props = $ReadOnly<{
  userId: number,
  color: string,
}>;

const componentStyles = createStyleSheet({
  outer: { flex: 1 },
  inner: { flexDirection: 'row', alignItems: 'center' },
});

export default function TitlePrivate(props: Props) {
  const { userId, color } = props;
  const user = useSelector(state => getAllUsersById(state).get(userId));

  if (!user) {
    return null;
  }
  return (
    <Touchable
      onPress={() => {
        if (!user) {
          return;
        }
        NavigationService.dispatch(navigateToAccountDetails(user.user_id));
      }}
      style={componentStyles.outer}
    >
      <View style={componentStyles.inner}>
        <UserAvatarWithPresenceById size={32} userId={user.user_id} />
        <ViewPlaceholder width={8} />
        <View>
          <Text style={[styles.navTitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {user.full_name}
          </Text>
          <ActivityText style={[styles.navSubtitle, { color }]} user={user} />
        </View>
      </View>
    </Touchable>
  );
}
