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

/**
 * A button component implementing a popular 'action button'
 * UI pattern. The button is circular, has an icon, and usually
 * ovlayed over the main UI in a prominent place.
 *
 * @prop [style] - Style applied to the wrapper component.
 * @prop disabled - If 'true' component can't be pressed and
 *   becomes visibly inactive.
 * @prop size - Diameter of the component in pixels.
 * @prop Icon - Icon component to render.
 * @prop onPress - Event called on component press.
 */
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
