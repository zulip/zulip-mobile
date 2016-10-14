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
    alignItems: 'stretch',
    flex: 1,
    height: 44,
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 10,
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

const ButtonInProgress = ({ containerStyle }) => (
  <View style={containerStyle}>
    <ActivityIndicator />
  </View>
);

const ButtonNormal = ({ containerStyle, touchTargetStyle, textStyle, text, onPress }) => (
  <View style={containerStyle}>
    <TouchableHighlight
      style={touchTargetStyle}
      underlayColor="rgba(34, 105, 63, 0.5)"
      onPress={onPress}
    >
      <Text style={textStyle}>
        {text}
      </Text>
    </TouchableHighlight>
  </View>
);


export default class Button extends React.PureComponent {

  props: {
    customStyles: Object,
    progress: boolean,
    text: string,
    secondary: boolean,
    onPress: () => void,
  }

  render() {
    const { customStyles, text, secondary, progress, onPress } = this.props;
    const containerStyle = [
      customStyles,
      styles.container,
      secondary ? styles.secondaryContainer : styles.primaryContainer,
    ];
    const textStyle = [
      styles.text,
      secondary ? styles.secondaryText : styles.primaryText,
    ];

    if (progress) {
      return <ButtonInProgress containerStyle={containerStyle} />;
    }

    return (
      <ButtonNormal
        containerStyle={containerStyle}
        touchTargetStyle={styles.touchTarget}
        text={text}
        onPress={onPress}
        textStyle={textStyle}
      />
    );
  }
}
