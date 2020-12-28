/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { BRAND_COLOR, createStyleSheet } from '../styles';
import { Icon } from '../common/Icons';
import type { IconNames } from '../common/Icons';
import NavButtonGeneral from './NavButtonGeneral';

type Props = $ReadOnly<{|
  color: string,
  style?: TextStyleProp,
  name: IconNames,
  onPress: () => void,
|}>;

export default class NavButton extends PureComponent<Props> {
  static defaultProps = {
    color: BRAND_COLOR,
  };

  styles = createStyleSheet({
    navButtonIcon: {
      textAlign: 'center',
      fontSize: 26,
    },
  });

  render() {
    const { name, style, color, onPress } = this.props;

    return (
      <NavButtonGeneral onPress={onPress}>
        <Icon style={[this.styles.navButtonIcon, style]} color={color} name={name} />
      </NavButtonGeneral>
    );
  }
}
