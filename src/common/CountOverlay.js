/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { ComponentWithOverlay, UnreadCount } from '.';
import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  button: {
    flex: 1,
  },
});

type Props = {|
  children: React$Node,
  unreadCount: number,
|};

export default class CountOverlay extends PureComponent<Props> {
  render() {
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
