/* @flow */
import React, { PureComponent } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';
import NavButton from '../nav/NavButton';

const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 16,
  },
  icon: {
    fontSize: 32,
  },
});

type Props = {
  style: StyleObj,
  displayMessage: string,
  onOptionsPress: () => void,
};

export default class LightboxFooter extends PureComponent<Props> {
  render() {
    const { displayMessage, onOptionsPress, style } = this.props;
    return (
      <View style={style}>
        <Text style={styles.text}>{displayMessage}</Text>
        <NavButton name="ios-more" color="white" style={styles.icon} onPress={onOptionsPress} />
      </View>
    );
  }
}
