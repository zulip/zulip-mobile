/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { shortTime, humanDate } from '../utils/date';
import { createStyleSheet } from '../styles';
import UserAvatarWithPresence from '../common/UserAvatarWithPresence';
import { Icon } from '../common/Icons';
import { OfflineNoticePlaceholder } from '../boot/OfflineNoticeProvider';
import type { UserId } from '../api/idTypes';

const styles = createStyleSheet({
  text: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 16,
  },
  name: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subheader: {
    color: 'white',
    fontSize: 12,
  },
  rightIconTouchTarget: {
    alignSelf: 'center',
    marginVertical: 4,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

type Props = $ReadOnly<{|
  senderName: string,
  senderId: UserId,
  timestamp: number,
  onPressBack: () => void,
|}>;

/**
 * Shows sender's name and date of photo being displayed.
 *
 * @prop [senderName] - The sender's full name.
 * @prop [avatarUrl]
 * @prop [timestamp]
 * @prop [onPressBack]
 */
export default function LightboxHeader(props: Props): Node {
  const { onPressBack, senderName, senderId, timestamp } = props;
  const displayDate = humanDate(new Date(timestamp * 1000));
  const time = shortTime(new Date(timestamp * 1000));
  const subheader = `${displayDate} at ${time}`;

  return (
    <SafeAreaView mode="padding" edges={['top']}>
      <OfflineNoticePlaceholder />
      <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.contentArea}>
        <UserAvatarWithPresence size={36} userId={senderId} />
        <View style={styles.text}>
          <Text style={styles.name} numberOfLines={1}>
            {senderName}
          </Text>
          <Text style={styles.subheader} numberOfLines={1}>
            {subheader}
          </Text>
        </View>
        <Pressable style={styles.rightIconTouchTarget} onPress={onPressBack} hitSlop={12}>
          {({ pressed }) => <Icon size={24} color={pressed ? 'gray' : 'white'} name="x" />}
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}
