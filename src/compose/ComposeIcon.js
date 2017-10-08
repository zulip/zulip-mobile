/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

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
  },
});

type Props = {
  isActive: boolean,
  name: string,
  onChange: (index: number) => {},
};

export default class ComposeIcon extends PureComponent<Props> {
  props: Props;

  render() {
    const { isActive, name, onChange } = this.props;

    return (
      <Touchable
        onPress={() => {
          onChange(0);
        }}
      >
        <Icon style={[styles.icon, isActive && styles.iconActive]} size={24} name={name} />
      </Touchable>
    );
  }
}
