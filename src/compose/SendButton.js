import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { BRAND_COLOR } from '../common/styles';

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
    const { disabled, onPress } = this.props;
    const opacity = { opacity: disabled ? 0.25 : 1 };

    return (
      <View style={styles.wrapper}>
        <View style={[styles.button, opacity]} onPress={disabled ? undefined : onPress}>
          <Icon size={16} color="white" name="send" />
        </View>
      </View>
    );
  }
}
