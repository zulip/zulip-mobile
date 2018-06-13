/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';

import type { Context, Style } from '../types';

type Props = {
  text: string,
  style?: Style,
};

/**
 * A component that on top of a standard Text component
 * provides ensures consistent styling for the default and night themes.
 * Unlike `Label` it does not translate its contents.
 *
 * @prop text - Main component to be rendered.
 * @prop [style] - Style object applied to the Text component.
 */
export default class RawLabel extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  render() {
    const styles = this.context.styles || {};
    const { text, style, ...restProps } = this.props;

    return (
      <Text style={[styles.label, style]} {...restProps}>
        {text}
      </Text>
    );
  }
}
