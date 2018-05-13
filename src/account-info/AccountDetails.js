/* @flow */
import React, { PureComponent } from 'react';
import { Text, View, Dimensions } from 'react-native';

import type { Auth, Actions, Presence } from '../types';
import { Avatar, ZulipButton } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { privateNarrow } from '../utils/narrow';
import UserStatusIndicator from '../common/UserStatusIndicator';
import { getMediumAvatar } from '../utils/avatar';

type Props = {
  auth: Auth,
  actions: Actions,
  email: string,
  presence: Presence,
  avatarUrl: string,
  fullName: string,
};

export default class AccountDetails extends PureComponent<Props, void> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handleChatPress = () => {
    const { email, actions } = this.props;
    actions.doNarrow(privateNarrow(email));
  };

  render() {
    const { styles } = this.context;
    const { avatarUrl, auth, email, fullName, presence } = this.props;
    const screenWidth = Dimensions.get('window').width;

    return (
      <View>
        <Avatar
          avatarUrl={getMediumAvatar(avatarUrl)}
          name={fullName}
          email={email}
          size={screenWidth}
          realm={auth.realm}
          shape="square"
        />
        <View style={[styles.row, styles.margin, styles.center]}>
          <UserStatusIndicator presence={presence} />
          <Text style={[styles.largerText, styles.halfMarginLeft]}>{email}</Text>
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
