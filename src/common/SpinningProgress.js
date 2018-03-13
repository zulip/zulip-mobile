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
