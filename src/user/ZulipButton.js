import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';

const styles = StyleSheet.create({
  buttonFrame: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    height: 44,
    backgroundColor: '#22693F',
    borderRadius: 5,
    width: 260,
  },
  buttonText: {
    color: '#FFFFFF',
  },
});

export default class ZulipButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      progress: false,
    };
  }

  render() {
    const { text, progress, onPress } = this.props;

    return (
      <TouchableHighlight
        disabled={progress}
        style={[styles.buttonFrame, this.props.style]}
        onPress={onPress}
      >
        {progress ?
          <ActivityIndicator /> :
          <Text style={styles.buttonText}>
            {text}
          </Text>
        }
      </TouchableHighlight>
    );
  }
}
