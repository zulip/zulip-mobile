/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { shortTime, humanDate } from '../utils/date';
import { createStyleSheet } from '../styles';
import { UserAvatarWithPresence, Touchable } from '../common';
import { Icon } from '../common/Icons';
import { AvatarURL } from '../utils/avatar';

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
  rightIcon: {
    fontSize: 36,
    alignSelf: 'center',
  },
  wrapper: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

type Props = $ReadOnly<{|
  senderName: string,
  senderEmail: string,
  timestamp: number,
  avatarUrl: AvatarURL,
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
export default class LightboxHeader extends PureComponent<Props> {
  render() {
    const { onPressBack, senderName, senderEmail, timestamp, avatarUrl } = this.props;
    const displayDate = humanDate(new Date(timestamp * 1000));
    const time = shortTime(new Date(timestamp * 1000));
    const subheader = `${displayDate} at ${time}`;

    return (
      <SafeAreaView mode="padding" edges={['top', 'right', 'left']}>
        <View style={styles.wrapper}>
          <UserAvatarWithPresence size={36} avatarUrl={avatarUrl} email={senderEmail} />
          <View style={styles.text}>
            <Text style={styles.name} numberOfLines={1}>
              {senderName}
            </Text>
            <Text style={styles.subheader} numberOfLines={1}>
              {subheader}
            </Text>
          </View>
          <Touchable onPress={onPressBack}>
            <Icon style={styles.rightIcon} color="white" name="x" />
          </Touchable>
        </View>
      </SafeAreaView>
    );
  }
}
