/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import type { Actions, Auth, StyleObj } from '../types';
import { Avatar } from '../common';
import Subheader from './Subheader';
import ReactionList from '../reactions/ReactionList';
import MessageTags from './MessageTags';
import HtmlChildrenContainer from './HtmlChildrenContainer';

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    padding: 8,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 8,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  inner: {
    flex: 1,
  },
});

type Props = {
  actions: Actions,
  style?: StyleObj,
  ownEmail: string,
  twentyFourHourTime: boolean,
  starred: boolean,
  auth?: Auth,
  message: Object,
  onLinkPress: string => void,
  onLongPress: () => void,
};

export default class MessageFull extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    starred: false,
  };

  handleAvatarPress = () => {
    const { message, actions } = this.props;
    actions.navigateToAccountDetails(message.sender_email);
  };

  render() {
    const {
      style,
      message,
      auth,
      actions,
      twentyFourHourTime,
      ownEmail,
      starred,
      onLongPress,
      onLinkPress,
    } = this.props;

    return (
      <View style={[styles.message, style]}>
        <Avatar
          avatarUrl={message.avatar_url}
          email={message.sender_email}
          name={message.sender_full_name}
          onPress={this.handleAvatarPress}
        />
        <View style={styles.content}>
          <Subheader
            from={message.sender_full_name}
            timestamp={message.timestamp}
            twentyFourHourTime={twentyFourHourTime}
          />
          <View style={styles.contentWrapper}>
            <ScrollView style={styles.inner}>
              <HtmlChildrenContainer
                message={message}
                auth={auth}
                actions={actions}
                onLinkPress={onLinkPress}
                onLongPress={onLongPress}
              />
            </ScrollView>
          </View>
          <MessageTags
            timestamp={message.last_edit_timestamp}
            starred={starred}
            isOutbox={message.isOutbox}
          />
          <ReactionList messageId={message.id} reactions={message.reactions} ownEmail={ownEmail} />
        </View>
      </View>
    );
  }
}
