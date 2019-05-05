/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node as React$Node } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {|
  behavior?: ?('height' | 'position' | 'padding'),
  children: React$Node,
  style?: ViewStyleProp,
  contentContainerStyle?: ViewStyleProp,
|};

export default class KeyboardAvoider extends PureComponent<Props> {
  render() {
    const { behavior, children, style, contentContainerStyle } = this.props;

    if (Platform.OS === 'android') {
      return <View style={style}>{children}</View>;
    }

    return (
      <KeyboardAvoidingView
        behavior={behavior}
        contentContainerStyle={contentContainerStyle}
        style={style}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }
}
