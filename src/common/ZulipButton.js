import React from 'react';
import { Image, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { BRAND_COLOR } from './styles';
import Touchable from './Touchable';

const styles = StyleSheet.create({
  frame: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  primaryFrame: {
    backgroundColor: BRAND_COLOR,
  },
  secondaryFrame: {
    borderWidth: 1,
    borderColor: BRAND_COLOR,
  },
  touchTarget: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 52,
  },
  image: {
    width: 44,
    height: 44,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: BRAND_COLOR,
  },
});

const ButtonInProgress = ({ frameStyle, secondary }) => (
  <View style={frameStyle}>
    <ActivityIndicator color={secondary ? BRAND_COLOR : 'white'} />
  </View>
);

const ButtonNormal = ({ frameStyle, touchTargetStyle, textStyle, text, image, onPress }) => (
  <View style={frameStyle}>
    <Touchable
      style={touchTargetStyle}
      onPress={onPress}
    >
      <Text style={textStyle}>
        {image &&
          <Image
            style={styles.image}
            resizeMode="contain"
            source={image}
          />}
        {text}
      </Text>
    </Touchable>
  </View>
);


export default class ZulipButton extends React.PureComponent {

  props: {
    customStyles: Object,
    progress: boolean,
    text: string,
    secondary: boolean,
    onPress: () => void,
  }

  render() {
    const { customStyles, text, secondary, progress, image, onPress } = this.props;

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
      return (
        <ButtonInProgress
          frameStyle={frameStyle}
          secondary={secondary}
        />
      );
    }

    return (
      <ButtonNormal
        frameStyle={frameStyle}
        touchTargetStyle={styles.touchTarget}
        text={text}
        image={image}
        onPress={onPress}
        textStyle={textStyle}
      />
    );
  }
}
