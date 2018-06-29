/* @flow */
import React, { PureComponent } from 'react';
import { View, Dimensions, Image, StyleSheet } from 'react-native';

import type { Auth, Dispatch, Context, Presence, User } from '../types';
import { Avatar, ComponentList, RawLabel, ZulipButton } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { privateNarrow } from '../utils/narrow';
import UserStatusIndicator from '../common/UserStatusIndicator';
import ActivityText from '../title/ActivityText';
import { getMediumAvatar, getGravatarFromEmail } from '../utils/avatar';
import { getFullUrl } from '../utils/url';
import { nowInTimeZone } from '../utils/date';
import { doNarrow } from '../actions';

type Props = {
  auth: Auth,
  dispatch: Dispatch,
  user: User,
  presence: Presence,
};

const screenWidth = Dimensions.get('window').width;

const componentStyles = StyleSheet.create({
  imageDimensions: {
    width: screenWidth,
    height: screenWidth,
  },
});

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
    const { avatar_url, email } = user;
    const mediumAvatarUrl = avatar_url ? getMediumAvatar(avatar_url) : null;
    const fullMediumAvatarUrl = mediumAvatarUrl
      ? getFullUrl(mediumAvatarUrl, auth.realm)
      : getGravatarFromEmail(email);
    const fullAvatarUrl = avatar_url
      ? getFullUrl(avatar_url, auth.realm)
      : getGravatarFromEmail(email);
    console.log(fullMediumAvatarUrl);
    console.log(fullAvatarUrl);

    return (
      <View>
        <Image
          source={{ uri: fullMediumAvatarUrl }}
          loadingIndicatorSource={{ uri: fullAvatarUrl }}
          style={componentStyles.imageDimensions}
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
