/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node as React$Node } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = $ReadOnly<{|
  behavior?: ?('height' | 'position' | 'padding'),
  children: React$Node,
  style?: ViewStyleProp,
  contentContainerStyle?: ViewStyleProp,

  /** How much the top of `KeyboardAvoider`'s layout *parent* is
   * displaced downward from the top of the screen.
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
|}>;

/**
 * Renders RN's `KeyboardAvoidingView` on iOS, `View` on Android.
 *
 * This component's props that are named after
 * `KeyboardAvoidingView`'s special props get passed straight through
 * to that component.
 */
export default class KeyboardAvoider extends PureComponent<Props> {
  render(): React$Node {
    const { behavior, children, style, contentContainerStyle, keyboardVerticalOffset } = this.props;

    if (Platform.OS === 'android') {
      return <View style={style}>{children}</View>;
    }

    return (
      <KeyboardAvoidingView
        behavior={behavior}
        contentContainerStyle={contentContainerStyle}
        // See comment on this prop in the jsdoc.
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={style}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }
}
