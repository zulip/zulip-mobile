/* @flow strict-local */

import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Narrow } from '../types';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { getUnreadCountForNarrow } from '../selectors';
import { Label } from '../common';
import MarkAsReadButton from './MarkAsReadButton';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';

const styles = createStyleSheet({
  unreadContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'hsl(232, 89%, 78%)',
    overflow: 'hidden',
  },
  safeAreaWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unreadTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 14,
    color: 'white',
  },
});

type Props = $ReadOnly<{|
  narrow: Narrow,
|}>;

/**
 * Says how many unread messages are in the narrow.
 *
 * Pads the left and right insets with its background.
 */
export default function UnreadNotice(props: Props) {
  const { narrow } = props;
  const unreadCount = useSelector(state => getUnreadCountForNarrow(state, narrow));

  return (
    <AnimatedScaleComponent visible={unreadCount > 0} style={styles.unreadContainer}>
      <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.safeAreaWrapper}>
        <View style={styles.unreadTextWrapper}>
          <Label
            style={styles.unreadText}
            text={{
              text: `{unreadCount, plural,
  =0 {No unread messages}
  =1 {# unread message}
  other {# unread messages}
}`,
              values: { unreadCount },
            }}
          />
        </View>
        <MarkAsReadButton narrow={narrow} />
      </SafeAreaView>
    </AnimatedScaleComponent>
  );
}
