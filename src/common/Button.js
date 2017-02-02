import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { BRAND_COLOR } from './styles';
import Touchable from './Touchable';

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
    borderColor: 'white',
    borderWidth: 2,
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
    <Touchable
      style={touchTargetStyle}
      onPress={onPress}
    >
      <Text style={textStyle}>
        {text}
      </Text>
    </Touchable>
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
      styles.frame,
      secondary ? styles.secondaryFrame : styles.primaryFrame,
      customStyles,
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
