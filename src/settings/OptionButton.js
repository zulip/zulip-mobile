/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label, Touchable } from '../common';
import { IconRight } from '../common/Icons';

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
  },
  optionTitle: {
    padding: 8,
    paddingLeft: 0,
  },
  rightIcon: {
    marginRight: 8,
  },
});

type Props = {
  label: string,
  onPress: () => void,
};

export default class OptionButton extends PureComponent<Props> {
  props: Props;

  render() {
    const { label, onPress } = this.props;

    return (
      <Touchable onPress={onPress}>
        <View style={styles.optionRow}>
          <Label style={styles.optionTitle} text={label} />
          <IconRight size={18} style={styles.rightIcon} />
        </View>
      </Touchable>
    );
  }
}
