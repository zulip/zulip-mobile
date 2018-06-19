/* @flow */
import React, { PureComponent } from 'react';
import { View, Dimensions } from 'react-native';

import type { Auth, Dispatch, Context, Presence, User } from '../types';
import { Avatar, ComponentList, RawLabel, ZulipButton } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { privateNarrow } from '../utils/narrow';
import UserStatusIndicator from '../common/UserStatusIndicator';
import ActivityText from '../title/ActivityText';
import { getMediumAvatar } from '../utils/avatar';
import { nowInTimeZone } from '../utils/date';
import { doNarrow } from '../actions';

type Props = {
  auth: Auth,
  dispatch: Dispatch,
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
    const { user, dispatch } = this.props;
    dispatch(doNarrow(privateNarrow(user.email)));
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
        <ComponentList outerSpacing itemStyle={[styles.row, styles.center]}>
          <View>
            <UserStatusIndicator presence={presence} hideIfOffline={false} />
            <RawLabel style={[styles.largerText, styles.halfMarginLeft]} text={user.email} />
          </View>
          <View>
            <ActivityText style={styles.largerText} email={user.email} />
          </View>
          {user.timezone ? (
            <View>
              <RawLabel
                style={styles.largerText}
                text={`${nowInTimeZone(user.timezone)} Local time`}
              />
            </View>
          ) : null}
          <ZulipButton
            text="Send private message"
            onPress={this.handleChatPress}
            Icon={IconPrivateChat}
          />
        </ComponentList>
      </View>
    );
  }
}
