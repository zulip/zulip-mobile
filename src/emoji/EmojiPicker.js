/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Emoji from './Emoji';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});

export default class EmojiPicker extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Emoji name="briefcase" />
      </View>
    );
  }
}
