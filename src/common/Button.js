import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';
import { BRAND_COLOR, HIGHLIGHT_COLOR } from './styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  primaryContainer: {
    backgroundColor: BRAND_COLOR,
  },
  secondaryContainer: {
    borderColor: BRAND_COLOR,
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
    color: BRAND_COLOR,
  },
});

const ButtonInProgress = ({ containerStyle }) => (
  <View style={containerStyle}>
    <ActivityIndicator color="white" />
  </View>
);

const ButtonNormal = ({ containerStyle, touchTargetStyle, textStyle, text, onPress }) => (
  <View style={containerStyle}>
    <TouchableHighlight
      style={touchTargetStyle}
      underlayColor={HIGHLIGHT_COLOR}
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
