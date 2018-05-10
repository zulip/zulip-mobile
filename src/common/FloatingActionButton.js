/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Style } from '../types';
import { BRAND_COLOR } from '../styles';
import { Touchable } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR,
    overflow: 'hidden',
  },
});

type Props = {
  style?: Style,
  disabled: boolean,
  size: number,
  Icon: any,
  onPress: () => void,
};

export default class FloatingActionButton extends PureComponent<Props> {
  props: Props;

  render() {
    const { style, size, disabled, onPress, Icon } = this.props;
    const iconSize = Math.trunc(size / 2);
    const customWrapperStyle = {
      width: size,
      height: size,
      borderRadius: size,
      opacity: disabled ? 0.25 : 1,
    };
    const iconStyle = {
      margin: Math.trunc(size / 4),
    };

    return (
      <View style={[styles.wrapper, customWrapperStyle, style]}>
        <Touchable onPress={disabled ? undefined : onPress}>
          <Icon style={iconStyle} size={iconSize} color="white" />
        </Touchable>
      </View>
    );
  }
}
