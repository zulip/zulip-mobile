/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node as React$Node } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import type { Style } from '../types';

type Props = {|
  behavior?: ?('height' | 'position' | 'padding'),
  children: React$Node,
  style?: Style,
  contentContainerStyle?: Style,
|};

export default class KeyboardAvoider extends PureComponent<Props> {
  render() {
    const { behavior, children, style, contentContainerStyle } = this.props;

    if (Platform.OS === 'android') {
      return <View style={style}>{children}</View>;
    }

    return (
      <KeyboardAvoidingView
        behavior={behavior /* v--- $FlowFixMe wants ViewStyleProp */}
        contentContainerStyle={contentContainerStyle}
        style={style}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }
}
