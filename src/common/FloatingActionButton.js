/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
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

    // This looks like it could clip the left/right of an icon if it's wider
    //   than it is tall? (This can happen: see
    //   https://github.com/zulip/zulip-mobile/pull/4730#discussion_r631342348.)
    //   See note on the Icon prop in the jsdoc.
    overflow: 'hidden',
  },
});

type Props = $ReadOnly<{|
  style?: ViewStyleProp,
  disabled: boolean,
  size: number,
  Icon: SpecificIconType,
  onPress: () => void,
  accessibilityLabel?: string,
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
 * @prop Icon - Icon component to render. Should be a square (?) - see note
 *   where we set overflow: 'hidden'
 * @prop onPress - Event called on component press.
 */
export default function FloatingActionButton(props: Props): Node {
  const { style, size, disabled, onPress, Icon, accessibilityLabel } = props;
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
    <Touchable
      style={style}
      onPress={disabled ? undefined : onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[styles.wrapper, customWrapperStyle]}>
        <Icon style={iconStyle} size={iconSize} color="white" />
      </View>
    </Touchable>
  );
}
