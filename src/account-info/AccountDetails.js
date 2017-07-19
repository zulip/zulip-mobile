/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

import { Avatar, ZulipButton } from '../common';
import { BRAND_COLOR } from '../styles';
import { privateNarrow } from '../utils/narrow';
import UserStatusIndicator from '../common/UserStatusIndicator';
import mediumAvatarUrl from '../utils/mediumAvatar';
import LandscapeContent from './AccountDetailsContent.landscape';
import PortraitContent from './AccountDetailsContent.portrait';
import type { UserStatus, Auth, Actions } from '../types';

const ORIENTATION_PORTRAIT = 'PORTRAIT';
const ORIENTATION_LANDSCAPE = 'LANDSCAPE';

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

export default class AccountDetails extends PureComponent {
  state = {
    layoutStyle: ORIENTATION_PORTRAIT,
  };

  props: {
    email: string,
    status: UserStatus,
    avatarUrl: string,
    fullName: string,
    auth: Auth,
    actions: Actions,
    orientation: string,
  };

  handleChatPress = () => {
    const { email, actions } = this.props;
    actions.doNarrow(privateNarrow(email));
    actions.navigateBack();
  };

  handleOrientationChange = (event: Object) => {
    this.setState({
      layoutStyle: this.props.orientation,
    });
  };

  renderAvatar = (width: number) =>
    <Avatar
      avatarUrl={mediumAvatarUrl(this.props.avatarUrl)}
      name={this.props.fullName}
      size={width}
      status={this.props.status}
      realm={this.props.auth.realm}
      shape="square"
    />;

  renderSendPMButton = () =>
    <ZulipButton
      style={styles.sendButton}
      text="Send private message"
      onPress={this.handleChatPress}
      icon="md-mail"
    />;

  renderUserDetails = () =>
    <View style={styles.details}>
      {this.props.status &&
        <UserStatusIndicator status={this.props.status} style={styles.statusIndicator} />}
      <Text style={styles.info}>
        {this.props.email}
      </Text>
    </View>;

  renderContent = (orientation: string, landscapeContent, portraitContent) =>
    orientation === ORIENTATION_LANDSCAPE ? landscapeContent : portraitContent;

  render() {
    const { layoutStyle } = this.state;
    const screenWidth = Dimensions.get('window').width;

    return this.renderContent(
      layoutStyle,
      <LandscapeContent
        screenWidth={screenWidth}
        handleOrientationChange={this.handleOrientationChange}
        avatar={this.renderAvatar}
        userDetails={this.renderUserDetails}
        sendButton={this.renderSendPMButton}
      />,
      <PortraitContent
        screenWidth={screenWidth}
        handleOrientationChange={this.handleOrientationChange}
        avatar={this.renderAvatar}
        userDetails={this.renderUserDetails}
        sendButton={this.renderSendPMButton}
      />,
    );
  }
}
