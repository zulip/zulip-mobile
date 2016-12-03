import React from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

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
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default class MessageFull extends React.PureComponent {

  props: {
    message: string,
    avatarUrl: string,
    from: string,
    timestamp: number,
    twentyFourHourTime: bool,
  };

  render() {
    const { message, avatarUrl, timestamp, twentyFourHourTime, from } = this.props;

    return (
      <View style={styles.message}>
        <Avatar avatarUrl={avatarUrl} name={from} />
        <View style={styles.content}>
          <Subheader
            from={from}
            timestamp={timestamp}
            twentyFourHourTime={twentyFourHourTime}
          />
          {message}
        </View>
      </View>
    );
  }
}
