/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { Text, View } from 'react-native';

import * as NavigationService from '../nav/NavigationService';
import type { UserId } from '../types';
import styles, { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { Touchable, ViewPlaceholder } from '../common';
import { UserAvatarWithPresenceById } from '../common/UserAvatarWithPresence';
import ActivityText from './ActivityText';
import { tryGetUserForId } from '../users/userSelectors';
import { navigateToAccountDetails } from '../nav/navActions';

type Props = $ReadOnly<{|
  userId: UserId,
  color: string,
|}>;

const componentStyles = createStyleSheet({
  outer: { flex: 1 },
  inner: { flexDirection: 'row', alignItems: 'center' },
  textWrapper: { flex: 1 },
});

export default function TitlePrivate(props: Props): Node {
  const { userId, color } = props;
  const user = useSelector(state => tryGetUserForId(state, userId));
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
        <View style={componentStyles.textWrapper}>
          <Text style={[styles.navTitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {user.full_name}
          </Text>
          <ActivityText style={[styles.navSubtitle, { color }]} user={user} />
        </View>
      </View>
    </Touchable>
  );
}
