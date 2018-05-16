/* @flow */
import React, { PureComponent } from 'react';
import { Text, View, Dimensions } from 'react-native';

import type { Auth, Actions, Presence, User } from '../types';
import { Avatar, Centerer, ZulipButton } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { privateNarrow } from '../utils/narrow';
import UserStatusIndicator from '../common/UserStatusIndicator';
import ActivityText from '../title/ActivityText';
import { getMediumAvatar } from '../utils/avatar';

type Props = {
  auth: Auth,
  actions: Actions,
  user: User,
  presence: Presence,
};

export default class AccountDetails extends PureComponent<Props, void> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handleChatPress = () => {
    const { user, actions } = this.props;
    actions.doNarrow(privateNarrow(user.email));
  };

  render() {
    const { styles } = this.context;
    const { user, auth, presence } = this.props;
    const screenWidth = Dimensions.get('window').width;

    return (
      <View>
        <Avatar
          avatarUrl={getMediumAvatar(user.avatar_url)}
          name={user.full_name}
          email={user.email}
          size={screenWidth}
          realm={auth.realm}
          shape="square"
        />
        <View style={[styles.row, styles.margin, styles.center]}>
          <UserStatusIndicator presence={presence} />
          <Text style={[styles.largerText, styles.halfMarginLeft]}>{user.email}</Text>
        </View>
        <View style={[styles.row, styles.margin, styles.center]}>
          <ActivityText style={styles.largerText} email={user.email} />
        </View>
        <ZulipButton
          style={styles.marginLeftRight}
          text="Send private message"
          onPress={this.handleChatPress}
          Icon={IconPrivateChat}
        />
      </View>
    );
  }
}
