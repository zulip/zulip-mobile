/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { Style } from '../types';

type Props = $ReadOnly<{|
  children: $ReadOnlyArray<Node>,
  spacing?: number,
  outerSpacing?: boolean,
  style?: ViewStyleProp,
  itemStyle?: Style,
|}>;

/**
 * A convenience component that uniformly styles and spaces its children.
 *
 * @prop children - Components to be styled.
 * @prop [spacing] - Set distance between components by setting
 *     marginBottom on all but the last component.
 * @prop [outerSpacing] - Set a margin around the list.
 * @prop [style] - Style of the wrapper container.
 * @prop [itemStyle] - Style applied to each child.
 */
export default function ComponentList(props: Props): Node {
  const { children, itemStyle, spacing = 16, outerSpacing = true, style } = props;
  const outerStyle = outerSpacing ? { margin: spacing } : {};
  const marginStyle = { marginBottom: spacing };
  const childrenToRender = React.Children.toArray(children).filter(child => child);
  const childrenWithStyles = childrenToRender.map((child, i) =>
    React.cloneElement(child, {
      style: [child.props.style, i + 1 < childrenToRender.length ? marginStyle : {}, itemStyle],
    }),
  );

  return <View style={[style, outerStyle]}>{childrenWithStyles}</View>;
}
