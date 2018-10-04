/* @flow */
import React, { PureComponent } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import type { Style } from '../types';
import Icon from '../common/Icons';

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
    alignSelf: 'center',
  },
});

type Props = {
  style?: Style,
  displayMessage: string,
  onOptionsPress: () => void,
};

export default class LightboxFooter extends PureComponent<Props> {
  props: Props;

  render() {
    const { displayMessage, onOptionsPress, style } = this.props;
    return (
      <View style={[styles.wrapper, style]}>
        <Text style={styles.text}>{displayMessage}</Text>
        <Icon style={styles.icon} color="white" name="more-vertical" onPress={onOptionsPress} />
      </View>
    );
  }
}
