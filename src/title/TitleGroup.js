import React from 'react';
import {
  StyleSheet,
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

export default class TitleGroup extends React.PureComponent {
  render() {
    const recipients = [];
    return (
      <View style={styles.wrapper}>
        {recipients.map(x => <Avatar />)}
      </View>
    );
  }
}
