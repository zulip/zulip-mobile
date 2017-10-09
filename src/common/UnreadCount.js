/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { StyleObj } from '../types';
import { BRAND_COLOR } from '../styles';
import { unreadToLimitedCount } from '../utils/unread';

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
  style?: StyleObj,
  color?: string,
  borderRadius?: number,
  isMuted?: boolean,
  count?: number,
  inverse?: boolean,
};

export default class UnreadCount extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    color: BRAND_COLOR,
    isMuted: false,
    borderRadius: 2,
  };

  render() {
    const { style, isMuted, borderRadius, color, count, inverse } = this.props;

    if (!count) return null;

    const frameStyle = [
      styles.frame,
      inverse && styles.frameInverse,
      isMuted && styles.frameMuted,
      { borderRadius },
      { backgroundColor: color },
      style,
    ];

    const textStyle = [styles.text, inverse && styles.textInverse];

    return (
      <View style={frameStyle}>
        <Text style={textStyle}>{unreadToLimitedCount(count)}</Text>
      </View>
    );
  }
}
