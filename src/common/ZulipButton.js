/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import TranslatedText from './TranslatedText';

import type { SpecificIconType } from './Icons';
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
  text: {
    color: 'hsl(0, 0%, 100%)',
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
  disabledPrimaryFrame: {
    backgroundColor: 'hsla(0, 0%, 50%, 0.4)',
  },
  disabledSecondaryFrame: {
    borderWidth: 1.5,
    borderColor: 'hsla(0, 0%, 50%, 0.4)',
  },
  disabledText: {
    color: 'hsla(0, 0%, 50%, 0.8)',
  },
});

type Props = $ReadOnly<{|
  style?: ViewStyleProp,
  progress: boolean,
  disabled: boolean,
  Icon?: SpecificIconType,
  text: string,
  secondary: boolean,
  onPress: () => void | Promise<void>,
|}>;

/**
 * A button component that is provides consistent look and feel
 * throughout the app. It can be disabled or show action-in-progress.
 *
 * If several buttons are on the same screen all or all but one should
 * have their `secondary` property set to `true`.
 *
 * @prop [style] - Style object applied to the outermost component.
 * @prop [progress] - Shows a progress indicator in place of the button text.
 * @prop [disabled] - If set the button is not pressable and visually looks disabled.
 * @prop [Icon] - Icon component to display in front of the button text
 * @prop text - The button text
 * @prop [secondary] - Less prominent styling, the button is not as important.
 * @prop onPress - Event called on button press.
 */
export default class ZulipButton extends PureComponent<Props> {
  static defaultProps = {
    secondary: false,
    disabled: false,
    progress: false,
  };

  render() {
    const { style, text, disabled, secondary, progress, onPress, Icon } = this.props;
    const frameStyle = [
      styles.frame,
      // Prettier bug on nested ternary
      /* prettier-ignore */
      disabled
        ? secondary
          ? styles.disabledSecondaryFrame
          : styles.disabledPrimaryFrame
        : secondary
          ? styles.secondaryFrame
          : styles.primaryFrame,
      style,
    ];
    const textStyle = [
      styles.text,
      disabled ? styles.disabledText : secondary ? styles.secondaryText : styles.primaryText,
    ];
    const iconStyle = [styles.icon, secondary ? styles.secondaryIcon : styles.primaryIcon];

    if (progress) {
      return (
        <View style={frameStyle}>
          <ActivityIndicator color="white" />
        </View>
      );
    }

    return (
      <View style={frameStyle}>
        <Touchable onPress={disabled ? undefined : onPress}>
          <View style={styles.buttonContent}>
            {!!Icon && <Icon style={iconStyle} size={25} />}
            <Text style={textStyle}>
              <TranslatedText text={text} />
            </Text>
          </View>
        </Touchable>
      </View>
    );
  }
}
