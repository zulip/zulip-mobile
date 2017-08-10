/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';
import { BRAND_COLOR } from '../styles';
import { Touchable } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class FloatingActionButton extends PureComponent {
  props: {
    style?: StyleObj,
    disabled: boolean,
    Icon: any,
    onPress: () => void,
  };

  render() {
    const { style, disabled, onPress, Icon } = this.props;
    const opacity = { opacity: disabled ? 0.25 : 1 };

    return (
      <Touchable style={[styles.wrapper, style]} onPress={disabled ? undefined : onPress}>
        <View style={[styles.button, opacity]}>
          <Icon size={16} color="white" />
        </View>
      </Touchable>
    );
  }
}
