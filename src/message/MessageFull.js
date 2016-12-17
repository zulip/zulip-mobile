import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Avatar } from '../common';
import Subheader from './Subheader';

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
    twentyFourHourTime: bool,
  };

  handleAvatarPress = () =>
    this.props.pushRoute('account-details', this.props.fromEmail);

  render() {
    const { message, avatarUrl, timestamp, twentyFourHourTime, fromName } = this.props;

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
        </View>
      </View>
    );
  }
}

export default connect(
  null,
  boundActions,
)(MessageFull);
