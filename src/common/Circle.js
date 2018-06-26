/* @flow */
import React from 'react';
import { ART } from 'react-native';

type Props = {
  color: string,
  size: number,
  thickness: number,
};

/**
 * Renders a circle using the ART library.
 * Exclusively used by the `SpinningProgress` component
 *
 * @prop color - The color of the circle.
 * @prop size - Diameter of the circle in pixels.
 * @prop thickness - Thickness of the circle in pixels.
 */
export default class Circle extends React.PureComponent<Props> {
  props: Props;

  render() {
    const { color, size, thickness } = this.props;

    const radius = (size - thickness) / 2;
    const circle = ART.Path()
      .move(size / 2, thickness / 2)
      .arc(0, radius * 2, radius)
      .arc(0, radius * -2, radius);

    return <ART.Shape d={circle} stroke={color} strokeWidth={thickness} />;
  }
}
