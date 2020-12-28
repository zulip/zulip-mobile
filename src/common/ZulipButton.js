/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheet';
import TranslatedText from './TranslatedText';

import type { LocalizableText } from '../types';
import type { SubsetProperties } from '../generics';
import type { SpecificIconType } from './Icons';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import Touchable from './Touchable';

const styles = createStyleSheet({
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
  disabledPrimaryFrame: {
    backgroundColor: 'hsla(0, 0%, 50%, 0.4)',
  },
  disabledSecondaryFrame: {
    borderWidth: 1.5,
    borderColor: 'hsla(0, 0%, 50%, 0.4)',
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
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

  text: {
    fontSize: 16,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: BRAND_COLOR,
  },
  disabledText: {
    color: 'hsla(0, 0%, 50%, 0.8)',
  },
});

type Props = $ReadOnly<{|
  /* eslint-disable flowtype/generic-spacing */
  style?: SubsetProperties<
    ViewStyle,
    {|
      // The use of specific style properties for callers to micromanage the
      // layout of the button is pretty chaotic and fragile, introducing
      // implicit dependencies on details of the ZulipButton implementation.
      // TODO: Assimilate those usages into a more coherent set of options
      //   provided by the ZulipButton interface explicitly.
      //
      // Until then, by listing here the properties we do use, we at least
      // make it possible when working on the ZulipButton implementation to
      // know the scope of different ways that callers can mess with the
      // styles.  If you need one not listed here and it's in the same
      // spirit as others that are, feel free to add it.
      margin?: mixed,
      marginTop?: mixed,
      marginBottom?: mixed,
      marginHorizontal?: mixed,
      // (... e.g., go ahead and add more variations on margin.)
      padding?: mixed,
      paddingLeft?: mixed,
      paddingRight?: mixed,
      height?: mixed,
      width?: mixed,
      borderWidth?: mixed,
      borderRadius?: mixed,
      flex?: mixed,
      alignSelf?: mixed,
      backgroundColor?: mixed,
    |},
  >,
  textStyle?: SubsetProperties<TextStyle, {| color?: mixed |}>,
  progress: boolean,
  disabled: boolean,
  Icon?: SpecificIconType,
  text: LocalizableText,
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
 * @prop [textStyle] - Style applied to the button text.
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
      this.props.textStyle,
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
