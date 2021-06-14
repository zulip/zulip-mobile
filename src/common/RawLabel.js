/* @flow strict-local */
import invariant from 'invariant';
import React, { PureComponent } from 'react';
import { Text } from 'react-native';

import type { ThemeData } from '../styles';
import { ThemeContext } from '../styles';

type Props = $ReadOnly<{|
  ...$Exact<React$ElementConfig<typeof Text>>,
  text?: string,
|}>;

/**
 * A thin wrapper for `Text` that ensures a consistent, themed style.
 *
 * Unlike `Label`, it does not translate its contents.
 *
 * Pass either `text` or `children`, but not both.
 *
 * @prop text - Contents for Text.
 * @prop [style] - Can override our default style for this component.
 * @prop ...all other Text props - Passed through verbatim to Text.
 *   See upstream: https://reactnative.dev/docs/text
 */
export default class RawLabel extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    const { text, children, style, ...restProps } = this.props;

    invariant((text != null) !== (children != null), 'pass either `text` or `children`');

    // These attributes will be applied unless specifically overridden
    // with the `style` prop -- even if this `<RawLabel />` is nested
    // and would otherwise inherit the attributes from its ancestors.
    const aggressiveDefaultStyle = {
      fontSize: 15,
      color: this.context.color,
    };

    return (
      <Text style={[aggressiveDefaultStyle, style]} {...restProps}>
        {text}
        {children}
      </Text>
    );
  }
}
