/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { UserId, UserOrBot } from '../types';
import UserAvatarWithPresence from '../common/UserAvatarWithPresence';
import ComponentWithOverlay from '../common/ComponentWithOverlay';
import Touchable from '../common/Touchable';
import { createStyleSheet } from '../styles';
import { IconCancel } from '../common/Icons';
import { getFullNameText } from '../users/userSelectors';
import ZulipTextIntl from '../common/ZulipTextIntl';

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
export default class AvatarItem extends PureComponent<Props> {
  handlePress: () => void = () => {
    const { user, onPress } = this.props;
    onPress(user.user_id);
  };

  render(): Node {
    const { user } = this.props;

    return (
      <View style={styles.wrapper}>
        <Touchable onPress={this.handlePress}>
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
          <ZulipTextIntl style={styles.text} text={getFullNameText({ user })} />
        </View>
      </View>
    );
  }
}
