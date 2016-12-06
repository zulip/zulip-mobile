import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Avatar } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  title: {
    color: 'white',
    fontSize: 16,
  },
});

export default class TitlePrivate extends React.PureComponent {
  render() {
    // const { fullName } = this.props;
    const fullName = 'Boris Yankov';

    return (
      <View style={styles.wrapper}>
        <Avatar name={fullName} size={24} />
        <Text style={styles.title}>
          {fullName}
        </Text>
      </View>
    );
  }
}
