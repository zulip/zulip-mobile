/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import ComponentWithOverlay from './ComponentWithOverlay';
import UnreadCount from './UnreadCount';
import { BRAND_COLOR, createStyleSheet } from '../styles';

const styles = createStyleSheet({
  button: {
    flex: 1,
  },
  overlayStyle: {
    right: -10,
    top: 10,
  },
});

type Props = $ReadOnly<{|
  children: Node,
  unreadCount: number,
|}>;

export default function CountOverlay(props: Props): Node {
  const { children, unreadCount } = props;

  return (
    <View>
      <ComponentWithOverlay
        style={styles.button}
        // It looks like what we want to match is 25 * 0.75, which is 18.75,
        // https://github.com/react-navigation/react-navigation/blob/%40react-navigation/bottom-tabs%405.11.15/packages/bottom-tabs/src/views/TabBarIcon.tsx#L69
        overlaySize={18.75}
        overlayColor={BRAND_COLOR}
        overlayPosition="top-right"
        showOverlay={unreadCount > 0}
        customOverlayStyle={styles.overlayStyle}
        overlay={<UnreadCount count={unreadCount} />}
      >
        {children}
      </ComponentWithOverlay>
    </View>
  );
}
