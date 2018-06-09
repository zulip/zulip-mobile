/* @flow */
import React, { PureComponent } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import type { Style } from '../types';
import NavButton from '../nav/NavButton';

const styles = StyleSheet.create({
  wrapper: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 8,
    flex: 1,
  },
  text: {
    color: 'white',
    fontSize: 14,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 28,
  },
});

type Props = {
  style?: Style,
  displayMessage: string,
  onOptionsPress: () => void,
};

export default class LightboxFooter extends PureComponent<Props> {
  render() {
    const { displayMessage, onOptionsPress, style } = this.props;
    return (
      <View style={[styles.wrapper, style]}>
        <Text style={styles.text}>{displayMessage}</Text>
        <NavButton
          name="more-vertical"
          color="white"
          style={styles.icon}
          onPress={onOptionsPress}
        />
      </View>
    );
  }
}
