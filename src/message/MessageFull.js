/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, ScrollView } from 'react-native';
import { connect } from 'react-redux';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { Avatar } from '../common';
import Subheader from './Subheader';
import ReactionList from '../reactions/ReactionList';
import MessageTags from './MessageTags';

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

class MessageFull extends PureComponent {
  props: {
    actions: Actions,
    ownEmail: string,
    twentyFourHourTime: boolean,
    starred: boolean,
    children?: any[],
    message: Object,
    onLongPress: () => void,
    outbox?: boolean,
  };

  handleAvatarPress = () => {
    const { message, actions } = this.props;
    actions.navigateToAccountDetails(message.sender_email);
  };

  render() {
    const {
      message,
      children,
      twentyFourHourTime,
      ownEmail,
      starred,
      onLongPress,
      outbox,
    } = this.props;
    return (
      <View style={styles.message}>
        <Avatar
          avatarUrl={message.avatar_url}
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
              <TouchableWithoutFeedback onLongPress={onLongPress}>
                <View>
                  {children}
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
          <MessageTags timestamp={message.last_edit_timestamp} starred={starred} outbox={outbox} />
          <ReactionList messageId={message.id} reactions={message.reactions} ownEmail={ownEmail} />
        </View>
      </View>
    );
  }
}

export default connect(null, boundActions)(MessageFull);
