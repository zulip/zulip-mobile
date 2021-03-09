/* @flow strict-local */
import React from 'react';
import { View } from 'react-native'
import { useSelector } from '../react-redux';
import UserAvatar from './UserAvatar';
import { getOwnUser } from '../users/userSelectors';
import { createStyleSheet } from '../styles';
import { IconServerColor } from '../common/Icons'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { showToast } from '../utils/info'
import type { Account } from '../types'
import { getActiveAccount } from '../selectors'

type Props = $ReadOnly<{|
  size: number,
    serverColor: string,
|}>;

const styles = createStyleSheet({
  selectedServerColorView: {
    position: 'absolute',
    right: 0,
  }
})

/**
 * Renders an image of the current user's avatar
 *
 * @prop size - Sets width and height in logical pixels.
 */
export default function OwnAvatar(props: Props) {
  const { size } = props;
  const activeAccount = useSelector(getActiveAccount)
  const user = useSelector(getOwnUser);
  return (
    <TouchableOpacity activeOpacity={1} onLongPress={() => { showToast(` ${activeAccount.email} \n ${activeAccount.realm} `) }} >
      <View style={{ padding: 7 }}>
        <UserAvatar avatarUrl={user.avatar_url} size={size} />
        <View style={styles.selectedServerColorView}>
          <IconServerColor size={13} color={activeAccount.serverColor} />
        </View>
      </View></TouchableOpacity>);
}
