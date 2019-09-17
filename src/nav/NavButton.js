/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { BRAND_COLOR, NAVBAR_SIZE } from '../styles';
import { Icon } from '../common/Icons';
import { Touchable } from '../common';
import type { IconNames } from '../common/Icons';

type Props = {|
  color: string,
  style?: TextStyleProp,
  name: IconNames,
  onPress: () => void,
|};

export default class NavButton extends PureComponent<Props> {
  static defaultProps = {
    color: BRAND_COLOR,
  };

  styles = StyleSheet.create({
    navButtonFrame: {
      width: NAVBAR_SIZE,
      height: NAVBAR_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navButtonIcon: {
      textAlign: 'center',
      fontSize: 26,
    },
  });

  render() {
    const { name, style, color, onPress } = this.props;

    return (
      <Touchable onPress={onPress}>
        <View style={this.styles.navButtonFrame}>
          <Icon style={[this.styles.navButtonIcon, style]} color={color} name={name} />
        </View>
      </Touchable>
    );
  }
}
