import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';

const styles = StyleSheet.create({
  buttonFrame: {
    flex: 1,
    alignItems: 'center',
    height: 44,
    backgroundColor: '#22693F',
    justifyContent: 'center',
    borderRadius: 5,
    width: 260,
  },
  buttonTouchTarget: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
  },
});

export default class ZulipButton extends React.Component {

  props: {
    progress: boolean,
  }

  render() {
    const { text, progress, onPress } = this.props;

    return progress ?
      <View style={[styles.buttonFrame, this.props.style]}>
        <ActivityIndicator />
      </View> :
      <View style={[styles.buttonFrame, this.props.style]}>
        <TouchableHighlight style={styles.buttonTouchTarget} onPress={onPress}>
          <Text style={styles.buttonText}>
            {text}
          </Text>
        </TouchableHighlight>
      </View>;
  }
}
