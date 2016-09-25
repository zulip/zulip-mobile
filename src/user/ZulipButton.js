import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    borderRadius: 5,
    width: 260,
  },
  primaryContainer: {
    backgroundColor: '#22693F',
  },
  secondaryContainer: {
    borderColor: '#22693F',
    borderWidth: 2,
  },
  touchTarget: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
  },
  primarytext: {
    color: 'white',
  },
  secondaryText: {
    color: '#22693F',
  },
});

export default class ZulipButton extends React.Component {

  props: {
    progress: boolean,
    text: string,
    secondary: boolean,
    onPress: () => void,
  }

  render() {
    const { text, secondary, progress, onPress } = this.props;
    const containerStyle = [
      styles.container,
      secondary ? styles.secondaryContainer : styles.primaryContainer,
    ];
    const textStyle = [
      styles.text,
      secondary ? styles.secondaryText : styles.primaryText,
    ];

    return progress ?
      <View style={containerStyle}>
        <ActivityIndicator />
      </View> :
      <View style={containerStyle}>
        <TouchableHighlight style={styles.touchTarget} onPress={onPress}>
          <Text style={textStyle}>
            {text}
          </Text>
        </TouchableHighlight>
      </View>;
  }
}
