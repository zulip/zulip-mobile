/* @flow */
import React from 'react';
import {
  StyleSheet,
} from 'react-native';

import { Touchable } from '../common';
import { BRAND_COLOR } from '../styles';
import Icon from '../common/Icons';

const styles = StyleSheet.create({
  icon: {
    padding: 8,
    color: '#999',
  },
  iconActive: {
    color: BRAND_COLOR,
  }
});

export default class ComposeIcon extends React.Component {

  props: {
    isActive?: boolean,
    name: string,
    onChange: (index: number) => {} | void,
    size?: number,
  }

  render() {
    const { isActive, name, onChange, size } = this.props;

    return (
      <Touchable onPress={() => { onChange(0); }}>
        <Icon
          style={[styles.icon, isActive && styles.iconActive]}
          size={(size) || 24}
          name={name}
        />
      </Touchable>
    );
  }
}
