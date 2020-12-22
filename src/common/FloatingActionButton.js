/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { SpecificIconType } from './Icons';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import Touchable from './Touchable';

const styles = createStyleSheet({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR,
    overflow: 'hidden',
  },
});

type Props = $ReadOnly<{|
  style?: ViewStyleProp,
  disabled: boolean,
  size: number,
  Icon: SpecificIconType,
  onPress: () => void,
|}>;

/**
 * A button component implementing a popular 'action button'
 * UI pattern. The button is circular, has an icon, and usually
 * overlayed over the main UI in a prominent place.
 *
 * @prop [style] - Style applied to the wrapper component.
 * @prop disabled - If 'true' component can't be pressed and
 *   becomes visibly inactive.
 * @prop size - Diameter of the component in pixels.
 * @prop Icon - Icon component to render.
 * @prop onPress - Event called on component press.
 */
export default class FloatingActionButton extends PureComponent<Props> {
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
      <Touchable style={style} onPress={disabled ? undefined : onPress}>
        <View style={[styles.wrapper, customWrapperStyle]}>
          <Icon style={iconStyle} size={iconSize} color="white" />
        </View>
      </Touchable>
    );
  }
}
