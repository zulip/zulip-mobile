/* @flow strict-local */
import invariant from 'invariant';
import React, { useContext } from 'react';
import type { Node } from 'react';
import { Text } from 'react-native';

import { ThemeContext } from '../styles';

type Props = $ReadOnly<{|
  ...$Exact<React$ElementConfig<typeof Text>>,
  text?: string,
|}>;

/**
 * A thin wrapper for `Text` that ensures a consistent, themed style.
 *
 * Unlike `ZulipTextIntl`, it does not translate its contents.
 *
 * Pass either `text` or `children`, but not both.
 *
 * @prop text - Contents for Text.
 * @prop [style] - Can override our default style for this component.
 * @prop ...all other Text props - Passed through verbatim to Text.
 *   See upstream: https://reactnative.dev/docs/text
 */
export default function ZulipText(props: Props): Node {
  const { text, children, style, ...restProps } = props;
  const themeData = useContext(ThemeContext);

  invariant(
    text != null || children != null,
    'ZulipText: `text` or `children` should be non-nullish',
  );
  invariant(text == null || children == null, 'ZulipText: `text` or `children` should be nullish');

  // These attributes will be applied unless specifically overridden
  // with the `style` prop -- even if this `<ZulipText />` is nested
  // and would otherwise inherit the attributes from its ancestors.
  const aggressiveDefaultStyle = {
    fontSize: 15,
    color: themeData.color,
  };

  return (
    <Text style={[aggressiveDefaultStyle, style]} {...restProps}>
      {text}
      {children}
    </Text>
  );
}
