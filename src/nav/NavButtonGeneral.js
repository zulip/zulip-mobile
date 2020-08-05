/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Node as React$Node } from 'react';

import { NAVBAR_SIZE } from '../styles';
import { Touchable } from '../common';
import { showToast } from '../utils/info';

type Props = $ReadOnly<{|
  children: React$Node,
  onPress: () => void,
  title?: string,
|}>;

export default class NavButtonGeneral extends PureComponent<Props> {
  styles = StyleSheet.create({
    navButtonFrame: {
      width: NAVBAR_SIZE,
      height: NAVBAR_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  handleLongPress = () => {
    const { title } = this.props;

    if (title !== undefined) {
      showToast(title);
    }
  };

  render() {
    const { children, onPress } = this.props;

    return (
      <Touchable onPress={onPress} onLongPress={this.handleLongPress}>
        <View style={this.styles.navButtonFrame}>{children}</View>
      </Touchable>
    );
  }
}
