/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Platform, View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KeyboardAvoidingView from '../third/react-native/KeyboardAvoidingView';

type Props = $ReadOnly<{|
  behavior?: ?('height' | 'position' | 'padding'),
  children: Node,
  style?: ViewStyleProp,
  contentContainerStyle?: ViewStyleProp,

  /**
   * How much the top of `KeyboardAvoider`'s layout *parent* is
   *   displaced downward from the top of the screen.
   *
   * If this isn't set correctly, the keyboard will hide some of
   * the bottom of the screen (an area whose height is what this
   * value should have been set to).
   *
   * I think `KeyboardAvoidingView`'s implementation mistakes `x`
   * and `y` from `View#onLayout` to be a `View`'s position
   * relative to the top left of the screen. In reality, I'm
   * pretty sure they represent a `View`'s position relative to
   * its parent:
   *   https://github.com/facebook/react-native-website/issues/2056#issuecomment-773618381
   *
   * But at least `KeyboardAvoidingView` exposes this prop, which
   * we can use to balance the equation if we need to.
   */
  keyboardVerticalOffset?: number,

  /**
   * Whether to shorten the excursion by the height of the bottom inset.
   *
   * Use this when a child component uses SafeAreaView to pad the bottom
   * inset, and you want the open keyboard to cover that padding.
   *
   * (SafeAreaView has a bug where it applies a constant padding no matter
   * where it's positioned onscreen -- so in particular, if you ask for
   * bottom padding, you'll get bottom padding even when KeyboardAvoider
   * pushes the SafeAreaView up and out of the bottom inset.)
   */
  compensateOverpadding?: boolean,
|}>;

/**
 * Renders RN's `KeyboardAvoidingView` on iOS, `View` on Android.
 *
 * This component's props that are named after
 * `KeyboardAvoidingView`'s special props get passed straight through
 * to that component.
 */
export default function KeyboardAvoider(props: Props): Node {
  const {
    behavior,
    children,
    style,
    contentContainerStyle,
    keyboardVerticalOffset = 0, // Same default value as KeyboardAvoidingView
    compensateOverpadding = false,
  } = props;

  const bottomInsetHeight = useSafeAreaInsets().bottom;

  if (Platform.OS === 'android') {
    return <View style={style}>{children}</View>;
  }

  return (
    <KeyboardAvoidingView
      behavior={behavior}
      contentContainerStyle={contentContainerStyle}
      // See comment on this prop in the jsdoc.
      keyboardVerticalOffset={
        keyboardVerticalOffset
        // A negative term here reduces the bottom inset we use for the
        // child, when the keyboard is open, so that the keyboard covers its
        // bottom padding.
        + (compensateOverpadding ? -bottomInsetHeight : 0)
      }
      style={style}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
