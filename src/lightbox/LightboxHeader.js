/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

import { shortTime, humanDate } from '../utils/date';
import { createStyleSheet } from '../styles';
import { UserAvatarWithPresence, Touchable } from '../common';
import { Icon } from '../common/Icons';

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
  timestamp: number,
  avatarUrl: string,
  onPressBack: () => void,
|}>;

export default class LightboxHeader extends PureComponent<Props> {
  render() {
    const { onPressBack, senderName, timestamp, avatarUrl } = this.props;
    const displayDate = humanDate(new Date(timestamp * 1000));
    const time = shortTime(new Date(timestamp * 1000));
    const subheader = `${displayDate} at ${time}`;

    return (
      <View style={styles.wrapper}>
        <UserAvatarWithPresence size={36} avatarUrl={avatarUrl} />
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
    );
  }
}
