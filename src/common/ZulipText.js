/* @flow strict-local */
import invariant from 'invariant';
import React, { useContext } from 'react';
import type { Node } from 'react';
import { Text } from 'react-native';
import type { ____TextStyle_Internal } from 'react-native/Libraries/StyleSheet/StyleSheetTypes'; // eslint-disable-line id-match

import { ThemeContext } from '../styles';

type Props = $ReadOnly<{|
  ...$Exact<React$ElementConfig<typeof Text>>,
  text?: string,

  inheritFontSize?: boolean,
  inheritColor?: boolean,
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
 * @prop inheritFontSize, etc. - Use instead of `styles.fontSize`, etc., to
 *   inherit value from an ancestor Text in the layout:
 *   https://reactnative.dev/docs/0.67/text#limited-style-inheritance
 * @prop ...all other Text props - Passed through verbatim to Text.
 *   See upstream: https://reactnative.dev/docs/text
 */
export default function ZulipText(props: Props): Node {
  const {
    text,
    children,
    style,
    inheritFontSize = false,
    inheritColor = false,
    ...restProps
  } = props;
  const themeData = useContext(ThemeContext);

  invariant(
    text != null || children != null,
    'ZulipText: `text` or `children` should be non-nullish',
  );
  invariant(text == null || children == null, 'ZulipText: `text` or `children` should be nullish');

  // These attributes will be applied unless specifically overridden with
  // the `style` or `inherit*` props -- even if this `<ZulipText />` is
  // nested and would otherwise inherit the attributes from its ancestors.
  const aggressiveDefaultStyle: $Rest<____TextStyle_Internal, { ... }> = {
    fontSize: 15,
    color: themeData.color,
    // If adding an attribute `foo`, give callers a prop `inheritFoo`.
  };

  if (inheritFontSize) {
    delete aggressiveDefaultStyle.fontSize;
  }
  if (inheritColor) {
    delete aggressiveDefaultStyle.color;
  }

  return (
    <Text style={[aggressiveDefaultStyle, style]} {...restProps}>
      {text}
      {children}
    </Text>
  );
}
