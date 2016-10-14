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
  frame: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  primaryFrame: {
    backgroundColor: BRAND_COLOR,
  },
  secondaryFrame: {
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

const ButtonInProgress = ({ frameStyle }) => (
  <View style={frameStyle}>
    <ActivityIndicator color="white" />
  </View>
);

const ButtonNormal = ({ frameStyle, touchTargetStyle, textStyle, text, onPress }) => (
  <View style={frameStyle}>
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
    const frameStyle = [
      customStyles,
      styles.frame,
      secondary ? styles.secondaryFrame : styles.primaryFrame,
    ];
    const textStyle = [
      styles.text,
      secondary ? styles.secondaryText : styles.primaryText,
    ];

    if (progress) {
      return <ButtonInProgress frameStyle={frameStyle} />;
    }

    return (
      <ButtonNormal
        frameStyle={frameStyle}
        touchTargetStyle={styles.touchTarget}
        text={text}
        onPress={onPress}
        textStyle={textStyle}
      />
    );
  }
}
