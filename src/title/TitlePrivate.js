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
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 16,
    paddingLeft: 4,
  },
});

export default class TitlePrivate extends React.PureComponent {
  render() {
    const { narrow } = this.props;
    const fullName = narrow[0].operand;

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
