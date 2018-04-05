/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';
import NavButton from '../nav/NavButton';
import { Label } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 5,
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
  style?: StyleObj,
  displayMessage: string,
  onOptionsPress: () => void,
};

export default class LightboxFooter extends PureComponent<Props> {
  render() {
    const { displayMessage, onOptionsPress, style } = this.props;
    return (
      <View style={[styles.wrapper, style]}>
        <Label style={styles.text} text={displayMessage} />
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
