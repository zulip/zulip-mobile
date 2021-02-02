/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import * as NavigationService from '../nav/NavigationService';
import styles, { createStyleSheet } from '../styles';
import { UserAvatarWithPresenceById } from '../common/UserAvatarWithPresence';
import { navigateToAccountDetails } from '../nav/navActions';

type Props = $ReadOnly<{|
  userIds: $ReadOnlyArray<number>,
|}>;

const componentStyles = createStyleSheet({
  titleAvatar: {
    marginRight: 16,
  },
});
export default class TitleGroup extends PureComponent<Props> {
  handlePress = (userId: number) => {
    NavigationService.dispatch(navigateToAccountDetails(userId));
  };

  render() {
    const { userIds } = this.props;
    return (
      <View style={styles.navWrapper}>
        {userIds.map(userId => (
          <View key={userId} style={componentStyles.titleAvatar}>
            <UserAvatarWithPresenceById
              onPress={() => this.handlePress(userId)}
              size={32}
              userId={userId}
            />
          </View>
        ))}
      </View>
    );
  }
}
