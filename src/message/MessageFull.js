import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Avatar, Touchable } from '../common';
import Subheader from './Subheader';
import ReactionList from '../reactions/ReactionList';

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
});

class MessageFull extends React.PureComponent {

  props: {
    avatarUrl: string,
    selfEmail: string,
    timestamp: number,
    reactions: [],
    twentyFourHourTime: bool,
  };

  handleAvatarPress = () =>
    this.props.pushRoute('account-details', this.props.message.sender_email);

  render() {
    const { message, children, avatarUrl, twentyFourHourTime, selfEmail, onLongPress } = this.props;

    return (
      <View style={styles.message}>
        <Avatar
          avatarUrl={avatarUrl}
          name={message.sender_full_name}
          onPress={this.handleAvatarPress}
        />
        <View style={styles.content}>
          <Subheader
            from={message.sender_full_name}
            timestamp={message.timestamp}
            twentyFourHourTime={twentyFourHourTime}
          />
          <Touchable onLongPress={onLongPress}>
            <View>
              {children}
            </View>
          </Touchable>
          <ReactionList
            messageId={message.id}
            reactions={message.reactions}
            selfEmail={selfEmail}
          />
        </View>
      </View>
    );
  }
}

export default connect(
  null,
  boundActions,
)(MessageFull);
