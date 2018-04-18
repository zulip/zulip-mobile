/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

import type { Auth, Actions, Orientation, Presence } from '../types';
import { Avatar, ZulipButton } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { BRAND_COLOR } from '../styles';
import { privateNarrow } from '../utils/narrow';
import UserStatusIndicator from '../common/UserStatusIndicator';
import { getMediumAvatar } from '../utils/avatar';
import LandscapeContent from './AccountDetailsContent.landscape';
import PortraitContent from './AccountDetailsContent.portrait';

const styles = StyleSheet.create({
  info: {
    textAlign: 'center',
    fontSize: 18,
    color: BRAND_COLOR,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  sendButton: {
    marginRight: 8,
    marginLeft: 8,
  },
});

type Props = {
  auth: Auth,
  actions: Actions,
  email: string,
  presence: Presence,
  avatarUrl: string,
  fullName: string,
  orientation: Orientation,
};

export default class AccountDetails extends PureComponent<Props, void> {
  props: Props;

  handleChatPress = () => {
    const { email, actions } = this.props;
    actions.doNarrow(privateNarrow(email));
  };

  render() {
    const { avatarUrl, auth, email, fullName, presence, orientation } = this.props;
    const screenWidth = Dimensions.get('window').width;

    const ContentComponent = orientation === 'LANDSCAPE' ? LandscapeContent : PortraitContent;

    return (
      <ContentComponent
        screenWidth={screenWidth}
        avatar={width => (
          <Avatar
            avatarUrl={getMediumAvatar(avatarUrl)}
            name={fullName}
            email={email}
            size={width}
            realm={auth.realm}
            shape="square"
          />
        )}
        userDetails={() => (
          <View style={styles.details}>
            <UserStatusIndicator presence={presence} style={styles.statusIndicator} />
            <Text style={styles.info}>{email}</Text>
          </View>
        )}
        sendButton={() => (
          <ZulipButton
            style={styles.sendButton}
            text="Send private message"
            onPress={this.handleChatPress}
            Icon={IconPrivateChat}
          />
        )}
      />
    );
  }
}
