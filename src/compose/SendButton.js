import React from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {BRAND_COLOR} from '../common/styles';
import {Touchable} from '../common';

const styles = StyleSheet.create({
  wrapper: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
    const {disabled, onPress} = this.props;
    const opacity = {opacity: disabled ? 0.25 : 1};

    return (
      <Touchable
        style={styles.wrapper}
        onPress={disabled ? undefined : onPress}
      >
        <View style={[styles.button, opacity]}>
          <Icon size={16} color="white" name="send" />
        </View>
      </Touchable>
    );
  }
}
