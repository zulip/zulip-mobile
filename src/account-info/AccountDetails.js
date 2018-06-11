/* @flow */
import React, { PureComponent } from 'react';
import { View, Dimensions } from 'react-native';

import type { Auth, Actions, Context, Presence, User } from '../types';
import { Avatar, RawLabel, ZulipButton } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { privateNarrow } from '../utils/narrow';
import UserStatusIndicator from '../common/UserStatusIndicator';
import ActivityText from '../title/ActivityText';
import { getMediumAvatar } from '../utils/avatar';
import { nowInTimeZone } from '../utils/date';

type Props = {
  auth: Auth,
  actions: Actions,
  user: User,
  presence: Presence,
};

export default class AccountDetails extends PureComponent<Props, void> {
  context: Context;
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
          <UserStatusIndicator presence={presence} hideIfOffline={false} />
          <RawLabel style={[styles.largerText, styles.halfMarginLeft]} text={user.email} />
        </View>
        <View style={[styles.row, styles.margin, styles.center]}>
          {/* Flow complains because ActivityText has a `presence` prop which
            we do not specify here. However, we don't need to, since the
            `presence` prop gets automatically assigned in ActivityText's
            creation with `connect`.
            $FlowFixMe */}
          <ActivityText style={styles.largerText} email={user.email} />
        </View>
        {user.timezone ? (
          <View style={[styles.row, styles.margin, styles.center]}>
            <RawLabel
              style={styles.largerText}
              text={`${nowInTimeZone(user.timezone)} Local time`}
            />
          </View>
        ) : null}
        <ZulipButton
          style={styles.marginHorizontal}
          text="Send private message"
          onPress={this.handleChatPress}
          Icon={IconPrivateChat}
        />
      </View>
    );
  }
}
