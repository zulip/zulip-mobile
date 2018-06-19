/* @flow */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { View } from 'react-native';

import type { Style } from '../types';

type Props = {
  children: ChildrenArray<*>,
  spacing?: number,
  outerSpacing?: boolean,
  style?: Style,
  itemStyle?: Style,
};

/**
 * A convenience component that uniformly styles and spaces its children.
 *
 * @param spacing Set distance between components by setting
 *     marginBottom on all but the last component.
 * @param outerSpacing Set a margin around the list.
 * @param itemStyle Style applied to each child.
 */
export default class ComponentList extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    outerSpacing: true,
    spacing: 16,
  };

  render() {
    const { children, itemStyle, spacing, outerSpacing, style } = this.props;
    const outerStyle = outerSpacing ? { margin: spacing } : {};
    const marginStyle = { marginBottom: spacing };

    return (
      <View style={[style, outerStyle]}>
        {React.Children.map(
          children,
          (child, i) =>
            child
            && React.cloneElement(child, {
              style: [child.props.style, i + 1 < children.length ? marginStyle : {}, itemStyle],
            }),
        )}
      </View>
    );
  }
}
