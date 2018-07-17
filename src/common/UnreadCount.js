/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Style } from '../types';
import { BRAND_COLOR } from '../styles';
import { unreadToLimitedCount } from '../utils/unread';
import { foregroundColorFromBackground } from '../utils/color';

const styles = StyleSheet.create({
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

type Props = {
  style?: Style,
  borderRadius: number,
  color: string,
  count: number,
  isMuted: boolean,
  inverse: boolean,
  limited: boolean,
};

/**
 * Unified way to display unread counts.
 *
 * @prop [style] - Style object for additional customization.
 * @prop [borderRadius] - Border radius of component frame in pixels.
 * @prop [color] - Background color.
 * @prop [count] - Numerical value for the unread count.
 * @prop [isMuted] - Flag indicating the entity to which the
 *   unread count value is related is muted. Styled differently.
 * @prop [inverse] - Indicate if styling should be inversed (dark on light).
 * @prop [limited] - If set values over 100 will display as `99+`.
 */
export default class UnreadCount extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    borderRadius: 2,
    color: BRAND_COLOR,
    count: 0,
    isMuted: false,
    inverse: false,
    limited: false,
  };

  render() {
    const { style, isMuted, borderRadius, color, count, inverse, limited } = this.props;

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

    return (
      <View style={frameStyle}>
        <Text style={textStyle} numberOfLines={1}>
          {limited ? unreadToLimitedCount(count) : count}
        </Text>
      </View>
    );
  }
}
