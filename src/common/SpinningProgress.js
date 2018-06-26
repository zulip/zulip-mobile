/* @flow */
import React from 'react';
import { ART } from 'react-native';

import { Arc, Circle } from './';
import AnimatedRotateComponent from '../animation/AnimatedRotateComponent';

type Props = {
  color: string,
  size: number,
  thickness: number,
};

/**
 * Renders a progress indicator - light circle and a darker
 * quarter of a circle overlapping it, spinning.
 *
 * @prop color - The color of the circle.
 * @prop size - Diameter of the circle in pixels.
 * @prop thickness - Thickness of the circle in pixels.
 */
export default class SpinningProgress extends React.PureComponent<Props> {
  props: Props;

  render() {
    const { color, size, thickness } = this.props;

    return (
      <AnimatedRotateComponent>
        <ART.Surface width={size} height={size}>
          <Circle color={`rgba(${color}, 0.25)`} size={size} thickness={thickness} />
          <Arc color={`rgba(${color}, 0.75)`} size={size} thickness={thickness} />
        </ART.Surface>
      </AnimatedRotateComponent>
    );
  }
}
