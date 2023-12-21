/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { UserId, UserOrBot } from '../types';
import UserAvatarWithPresence from '../common/UserAvatarWithPresence';
import ComponentWithOverlay from '../common/ComponentWithOverlay';
import Touchable from '../common/Touchable';
import { createStyleSheet } from '../styles';
import { IconCancel } from '../common/Icons';
import { getFullNameReactText } from '../users/userSelectors';
import ZulipTextIntl from '../common/ZulipTextIntl';
import { useSelector } from '../react-redux';
import { getRealm } from '../directSelectors';

const styles = createStyleSheet({
  wrapper: {
    flexDirection: 'column',
    marginLeft: 8,
    marginVertical: 8,
  },
  text: {
    flex: 1,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  textFrame: {
    width: 50,
    flexDirection: 'row',
  },
});

type Props = $ReadOnly<{|
  user: UserOrBot,
  onPress: UserId => void,
|}>;

/**
 * Pressable avatar for items in the user-picker card.
 */
export default function AvatarItem(props: Props): Node {
  const { user, onPress } = props;

  const enableGuestUserIndicator = useSelector(state => getRealm(state).enableGuestUserIndicator);

  const handlePress = React.useCallback(() => {
    onPress(user.user_id);
  }, [onPress, user.user_id]);

  return (
    <View style={styles.wrapper}>
      <Touchable onPress={handlePress}>
        <ComponentWithOverlay
          overlaySize={20}
          overlayColor="white"
          overlayPosition="bottom-right"
          overlay={<IconCancel color="gray" size={20} />}
        >
          <UserAvatarWithPresence key={user.user_id} size={50} userId={user.user_id} />
        </ComponentWithOverlay>
      </Touchable>
      <View style={styles.textFrame}>
        <ZulipTextIntl
          style={styles.text}
          text={getFullNameReactText({ user, enableGuestUserIndicator })}
        />
      </View>
    </View>
  );
}
