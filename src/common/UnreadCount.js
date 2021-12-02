/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Text, View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { BRAND_COLOR, createStyleSheet } from '../styles';
import { foregroundColorFromBackground } from '../utils/color';

const styles = createStyleSheet({
  frame: {
    paddingTop: 2,
    paddingRight: 4,
    paddingBottom: 2,
    paddingLeft: 4,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
  frameInverse: {
    backgroundColor: 'white',
  },
  textInverse: {
    color: BRAND_COLOR,
  },
  frameMuted: {
    opacity: 0.5,
  },
});

type Props = $ReadOnly<{|
  style?: ViewStyleProp,
  color?: string,
  count?: number,
  inverse?: boolean,
|}>;

/**
 * Unified way to display unread counts.
 *
 * @prop [style] - Style object for additional customization.
 * @prop [color] - Background color.
 * @prop [count] - Numerical value for the unread count.
 * @prop [inverse] - Indicate if styling should be inverted (dark on light).
 */
export default function UnreadCount(props: Props): Node {
  const {
    style,
    isMuted = false,
    borderRadius = 2,
    color = BRAND_COLOR,
    count = 0,
    inverse = false,
    limited = false,
  } = props;

  if (!count) {
    return null;
  }

  const frameStyle = [
    styles.frame,
    inverse && styles.frameInverse,
    isMuted && styles.frameMuted,
    { borderRadius },
    { backgroundColor: color },
    style,
  ];

  const textColor = foregroundColorFromBackground(color);
  const textStyle = [styles.text, inverse && styles.textInverse, { color: textColor }];

  const countString = limited && count >= 100 ? '99+' : count.toString();
  return (
    <View style={frameStyle}>
      <Text style={textStyle} numberOfLines={1}>
        {countString}
      </Text>
    </View>
  );
}
