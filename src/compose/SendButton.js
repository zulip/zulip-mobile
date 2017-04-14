import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../common/styles';
import { Touchable } from '../common';
import { IconSend } from '../common/Icons';

const styles = StyleSheet.create({
  wrapper: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class SendButton extends React.Component {

  props: {
    disabled: boolean,
    onPress: () => void,
  };

  render() {
    const { disabled, onPress } = this.props;
    const opacity = { opacity: disabled ? 0.25 : 1 };

    // Use <View> as wrapper in disabled state to remove highlight that remains stuck due to
    // slow communication of RN component with native component.
    const WrapperComponent = disabled ? View : Touchable;

    return (
      <WrapperComponent style={styles.wrapper} onPress={disabled ? undefined : onPress} >
        <View style={[styles.button, opacity]}>
          <IconSend size={16} color="white" />
        </View>
      </WrapperComponent>
    );
  }
}
