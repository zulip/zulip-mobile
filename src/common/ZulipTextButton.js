/* @flow strict-local */
import React, { useMemo } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { LocalizableText } from '../types';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { Label } from '.';
import Touchable from './Touchable';

// When adding a variant, take care that it's legitimate, it addresses a
// common use case consistently, and its styles are defined coherently. We
// don't want this component to grow brittle with lots of little flags to
// micromanage its styles.
type Variant = 'standard';

const styleSheetForVariant = (variant: Variant) =>
  createStyleSheet({
    // See https://material.io/components/buttons#specs.
    touchable: {
      height: 36,
      paddingHorizontal: 8,
      minWidth: 64,
    },

    // Chosen because of the value for this distance at
    // https://material.io/components/banners#specs. A banner is one context
    // where we've wanted to use text buttons.
    leftMargin: {
      marginLeft: 8,
    },
    rightMargin: {
      marginRight: 8,
    },

    // `Touchable` only accepts one child, so make sure it fills the
    // `Touchable`'s full area and centers everything in it.
    childOfTouchable: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    text: {
      // From the spec:
      // > Text labels need to be distinct from other elements. If the text
      // > label isn’t fully capitalized, it should use a different color,
      // > style, or layout from other text.
      textTransform: 'uppercase',
      color: BRAND_COLOR,

      textAlign: 'center',
      textAlignVertical: 'center',
    },
  });

type Props = $ReadOnly<{|
  /** See note on the `Variant` type. */
  variant?: Variant,

  /**
   * Give a left margin of the correct in-between space for a set of buttons
   */
  leftMargin?: true,

  /**
   * Give a right margin of the correct in-between space for a set of
   *   buttons
   */
  rightMargin?: true,

  /**
   * The text label: https://material.io/components/buttons#text-button
   *
   * Should be short.
   */
  label: LocalizableText,

  onPress: () => void | Promise<void>,
|}>;

/**
 * A button modeled on Material Design's "text button" concept.
 *
 * See https://material.io/components/buttons#text-button :
 *
 * > Text buttons are typically used for less-pronounced actions, including
 * > those located
 * >
 * > - In dialogs
 * > - In cards
 * >
 * > In cards, text buttons help maintain an emphasis on card content.
 */
// TODO: Consider making this a thin wrapper around something like
// react-native-paper's `Button`
// (https://callstack.github.io/react-native-paper/button.html), encoding
// things like project-specific styles and making any sensible adjustments
// to the interface.
export default function ZulipTextButton(props: Props): Node {
  const { variant = 'standard', leftMargin, rightMargin, label, onPress } = props;

  const variantStyles = useMemo(() => styleSheetForVariant(variant), [variant]);

  return (
    <Touchable
      style={[
        variantStyles.touchable,
        leftMargin && variantStyles.leftMargin,
        rightMargin && variantStyles.rightMargin,
      ]}
      onPress={onPress}
    >
      <View style={variantStyles.childOfTouchable}>
        <Label style={variantStyles.text} text={label} />
      </View>
    </Touchable>
  );
}
