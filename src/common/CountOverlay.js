/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { ComponentWithOverlay, UnreadCount } from '.';
import { BRAND_COLOR, createStyleSheet } from '../styles';

const styles = createStyleSheet({
  button: {
    flex: 1,
  },
});

type Props = $ReadOnly<{|
  children: Node,
  unreadCount: number,
|}>;

export default class CountOverlay extends PureComponent<Props> {
  render(): Node {
    const { children, unreadCount } = this.props;

    return (
      <View>
        <ComponentWithOverlay
          style={styles.button}
          overlaySize={15}
          overlayColor={BRAND_COLOR}
          overlayPosition="top-right"
          showOverlay={unreadCount > 0}
          overlay={<UnreadCount count={unreadCount} />}
        >
          {children}
        </ComponentWithOverlay>
      </View>
    );
  }
}
