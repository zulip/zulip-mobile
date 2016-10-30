import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { BRAND_COLOR } from '../common/styles';

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    padding: 2,
    borderRadius: 22,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    color: 'white',
  },
});

export default class SendButton extends React.PureComponent {

  props: {
    onPress: () => void,
  };

  render() {
    const { onPress } = this.props;

    return (
      <View style={styles.container} onPress={onPress}>
        <Icon size={24} color="white" name="send" />
      </View>
    );
  }
}
