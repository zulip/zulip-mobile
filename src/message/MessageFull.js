import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Avatar } from '../common';
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
    message: string,
    avatarUrl: string,
    fromName: string,
    fromEmail: string,
    timestamp: number,
    reactions: [],
    twentyFourHourTime: bool,
  };

  handleAvatarPress = () =>
    this.props.pushRoute('account-details', this.props.fromEmail);

  render() {
    const {
      messageId, message, avatarUrl, timestamp,
      twentyFourHourTime, fromName, reactions, selfEmail,
    } = this.props;

    return (
      <View style={styles.message}>
        <Avatar
          avatarUrl={avatarUrl}
          name={fromName}
          onPress={this.handleAvatarPress}
        />
        <View style={styles.content}>
          <Subheader
            from={fromName}
            timestamp={timestamp}
            twentyFourHourTime={twentyFourHourTime}
          />
          {message}
          <ReactionList
            messageId={messageId}
            reactions={reactions}
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
