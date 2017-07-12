/* @flow */
import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
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

class MessageFull extends React.PureComponent {
  props: {
    actions: Actions,
    avatarUrl: string,
    ownEmail: string,
    twentyFourHourTime: boolean,
    realm: string,
    starred: boolean,
    children?: any[],
    message: Object,
    onLongPress: () => void,
  };

  handleAvatarPress = () => {
    const { message, actions } = this.props;
    actions.navigateToAccountDetails(message.sender_email);
  };

  render() {
    const {
      message,
      children,
      avatarUrl,
      twentyFourHourTime,
      ownEmail,
      starred,
      onLongPress,
      realm,
    } = this.props;

    return (
      <View style={styles.message}>
        <Avatar
          avatarUrl={avatarUrl}
          name={message.sender_full_name}
          onPress={this.handleAvatarPress}
          realm={realm}
        />
        <View style={styles.content}>
          <Subheader
            from={message.sender_full_name}
            timestamp={message.timestamp}
            twentyFourHourTime={twentyFourHourTime}
          />
          <View style={styles.contentWrapper}>
            <TouchableWithoutFeedback onLongPress={onLongPress}>
              <View style={styles.inner}>
                {children}
              </View>
            </TouchableWithoutFeedback>
          </View>
          <MessageTags timestamp={message.last_edit_timestamp} starred={starred} />
          <ReactionList messageId={message.id} reactions={message.reactions} ownEmail={ownEmail} />
        </View>
      </View>
    );
  }
}

export default connect(null, boundActions)(MessageFull);
