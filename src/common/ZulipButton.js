/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import TranslatedText from './TranslatedText';

import type { Style } from '../types';
import type { Icon as IconType } from './Icons';
import { BRAND_COLOR } from '../styles';
import Touchable from './Touchable';

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  frame: {
    height: 44,
    justifyContent: 'center',
    borderRadius: 22,
    overflow: 'hidden',
  },
  primaryFrame: {
    backgroundColor: BRAND_COLOR,
  },
  secondaryFrame: {
    borderWidth: 1.5,
    borderColor: BRAND_COLOR,
  },
  fullSizeFrame: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 0,
    flex: 1,
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
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: BRAND_COLOR,
  },
  icon: {
    marginRight: 8,
  },
  primaryIcon: {
    color: 'white',
  },
  secondaryIcon: {
    color: BRAND_COLOR,
  },
  disabled: {
    opacity: 0.25,
  },
});

type ButtonInProgressProps = {|
  frameStyle: Style,
|};

const ButtonInProgress = ({ frameStyle }: ButtonInProgressProps) => (
  <View style={frameStyle}>
    <ActivityIndicator color="white" />
  </View>
);

type ButtonNormalProps = {|
  frameStyle: Style,
  touchTargetStyle: Style,
  textStyle: Style,
  text: string,
  iconStyle: Style,
  Icon?: IconType,
  onPress?: () => void | Promise<void>,
|};

const ButtonNormal = ({
  frameStyle,
  touchTargetStyle,
  textStyle,
  text,
  onPress,
  Icon,
  iconStyle,
}: ButtonNormalProps) => (
  <View style={frameStyle}>
    <Touchable style={touchTargetStyle} onPress={onPress}>
      <View style={styles.buttonContent}>
        {Icon && <Icon style={iconStyle} size={25} />}
        <Text style={textStyle}>
          <TranslatedText text={text} />
        </Text>
      </View>
    </Touchable>
  </View>
);

type Props = {|
  style?: Style,
  progress: boolean,
  disabled: boolean,
  Icon?: IconType,
  text: string,
  secondary: boolean,
  fullSize: boolean,
  onPress: () => void | Promise<void>,
|};

/**
 * A button component that is provides consistent look and feel
 * throughout the app. It can be disabled or show action-in-progress.
 *
 * If several buttons are on the same screen all or all but one should
 * have their `secondary` property set to `true`.
 *
 * @prop [style] - Style object applied to the Text component.
 * @prop [progress] - Shows a progress indicator in place of the button text.
 * @prop [disabled] - If set the button is not pressable and visually looks disabled.
 * @prop [Icon] - Icon component to display in front of the button text
 * @prop text - The button text
 * @prop [secondary] - Less prominent styling, the button is not as important.
 * @prop [fullSize] - The button becomes as wide as its container.
 * @prop onPress - Event called on button press.
 */
export default class ZulipButton extends PureComponent<Props> {
  static defaultProps = {
    secondary: false,
    fullSize: false,
    disabled: false,
    progress: false,
  };

  render() {
    const { style, text, disabled, secondary, progress, fullSize, onPress, Icon } = this.props;
    const frameStyle = [
      styles.frame,
      secondary ? styles.secondaryFrame : styles.primaryFrame,
      fullSize && styles.fullSizeFrame,
      disabled && styles.disabled,
      style,
    ];
    const textStyle = [styles.text, secondary ? styles.secondaryText : styles.primaryText];
    const iconStyle = [styles.icon, secondary ? styles.secondaryIcon : styles.primaryIcon];

    if (progress) {
      return <ButtonInProgress frameStyle={frameStyle} />;
    }

    return (
      <ButtonNormal
        frameStyle={frameStyle}
        touchTargetStyle={styles.touchTarget}
        text={text}
        onPress={disabled ? undefined : onPress}
        textStyle={textStyle}
        Icon={Icon}
        iconStyle={iconStyle}
      />
    );
  }
}
