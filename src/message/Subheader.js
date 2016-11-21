import React from 'react';

import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import Timestamp from './Timestamp';

const styles = StyleSheet.create({
  subheader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default class Subheader extends React.PureComponent {

  props: {
    from: string,
    timestamp: number,
  };

  render() {
    const { timestamp, from } = this.props;

    return (
      <View style={styles.subheader}>
        <Text style={styles.username}>
          {from}
        </Text>
        <Timestamp time={timestamp} />
      </View>
    );
  }
}
