/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../styles';
import { Touchable } from '../common';
import { IconDone, IconSend } from '../common/Icons';
import { EditMessage } from '../types';

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class SubmitButton extends PureComponent {
  props: {
    disabled: boolean,
    onPress: () => void,
    editMessage?: EditMessage,
  };

  render() {
    const { disabled, onPress, editMessage } = this.props;
    const opacity = { opacity: disabled ? 0.25 : 1 };
    const Icon = editMessage === null ? IconSend : IconDone;
    // Use <View> as wrapper in disabled state to remove highlight that remains stuck due to
    // slow communication of RN component with native component.
    const WrapperComponent = disabled ? View : Touchable;

    return (
      <WrapperComponent style={styles.wrapper} onPress={disabled ? undefined : onPress}>
        <View style={[styles.button, opacity]}>
          <Icon size={16} color="white" />
        </View>
      </WrapperComponent>
    );
  }
}
