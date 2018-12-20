/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, Dimensions } from 'react-native';

import type { Dispatch, Context, Presence, User } from '../types';
import { Avatar, ComponentList, RawLabel, ZulipButton } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { privateNarrow } from '../utils/narrow';
import UserStatusIndicator from '../common/UserStatusIndicator';
import ActivityText from '../title/ActivityText';
import { getMediumAvatar } from '../utils/avatar';
import { nowInTimeZone } from '../utils/date';
import { doNarrow } from '../actions';

type Props = {|
  dispatch: Dispatch,
  user: User,
  presence: Presence,
|};

export default class AccountDetails extends PureComponent<Props, void> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  handleChatPress = () => {
    const { user, dispatch } = this.props;
    dispatch(doNarrow(privateNarrow(user.email)));
  };

  render() {
    const { styles: contextStyles } = this.context;
    const { user, presence } = this.props;
    const screenWidth = Dimensions.get('window').width;

    return (
      <View>
        <Avatar
          avatarUrl={typeof user.avatar_url === 'string' ? getMediumAvatar(user.avatar_url) : null}
          name={user.full_name}
          email={user.email}
          size={screenWidth}
          shape="square"
        />
        <ComponentList outerSpacing itemStyle={[contextStyles.row, contextStyles.center]}>
          <View>
            <UserStatusIndicator presence={presence} hideIfOffline={false} />
            <RawLabel
              style={[contextStyles.largerText, contextStyles.halfMarginLeft]}
              text={user.email}
            />
          </View>
          <View>
            <ActivityText style={contextStyles.largerText} email={user.email} />
          </View>
          {user.timezone ? (
            <View>
              <RawLabel
                style={contextStyles.largerText}
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
