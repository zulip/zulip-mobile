/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { Narrow } from '../types';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { getUnreadCountForNarrow } from '../selectors';
import { Label, RawLabel } from '../common';
import MarkAsReadButton from './MarkAsReadButton';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';

const styles = createStyleSheet({
  unreadContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'hsl(232, 89%, 78%)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  unreadTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadNumber: {
    fontSize: 14,
    color: 'white',
    paddingRight: 4,
  },
  unreadNumberExceeds: {
      fontSize: 12,
      color: 'white',
      paddingRight: 4,
    },
  unreadText: {
    fontSize: 14,
    color: 'white',
  },
});

type Props = $ReadOnly<{|
  narrow: Narrow,
|}>;

export default function UnreadNotice(props: Props): Node {
  const { narrow } = props;
  const unreadCount = useSelector(state => getUnreadCountForNarrow(state, narrow));

  return (
    <AnimatedScaleComponent visible={unreadCount > 0} style={styles.unreadContainer}>
      <View style={styles.unreadTextWrapper}>
        <RawLabel style={unreadCount > 99 ? styles.unreadNumberExceeds : styles.unreadNumber} text={unreadCount > 99 ? '99+' : unreadCount.toString()} />
        <Label
          style={styles.unreadText}
          text={unreadCount === 1 ? 'unread message' : 'unread messages'}
        />
      </View>
      <MarkAsReadButton narrow={narrow} />
    </AnimatedScaleComponent>
  );
}
