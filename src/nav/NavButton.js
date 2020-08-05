/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { BRAND_COLOR } from '../styles';
import { Icon } from '../common/Icons';
import type { IconNames } from '../common/Icons';
import NavButtonGeneral from './NavButtonGeneral';

type Props = $ReadOnly<{|
  color: string,
  style?: TextStyleProp,
  name: IconNames,
  onPress: () => void,
  title?: string,
|}>;

export default class NavButton extends PureComponent<Props> {
  static defaultProps = {
    color: BRAND_COLOR,
  };

  styles = StyleSheet.create({
    navButtonIcon: {
      textAlign: 'center',
      fontSize: 26,
    },
  });

  render() {
    const { name, style, color, onPress, title } = this.props;

    return (
      <NavButtonGeneral onPress={onPress} title={title}>
        <Icon style={[this.styles.navButtonIcon, style]} color={color} name={name} />
      </NavButtonGeneral>
    );
  }
}
