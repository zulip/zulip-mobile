/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { NAVBAR_SIZE, createStyleSheet } from '../styles';
import { Touchable } from '../common';

type Props = $ReadOnly<{|
  children: Node,
  onPress: () => void,
  accessibilityLabel?: string,
|}>;

const componentStyles = createStyleSheet({
  navButtonFrame: {
    width: NAVBAR_SIZE,
    height: NAVBAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class NavButtonGeneral extends PureComponent<Props> {
  render() {
    const { children, onPress, accessibilityLabel } = this.props;

    return (
      <Touchable onPress={onPress} accessibilityLabel={accessibilityLabel}>
        <View style={componentStyles.navButtonFrame}>{children}</View>
      </Touchable>
    );
  }
}
