/* @flow strict-local */
import React from 'react';
import { Image } from 'react-native';

import AnimatedRotateComponent from '../animation/AnimatedRotateComponent';
import spinningProgressImg from '../../static/img/spinning-progress.png';
import spinningProgressBlackImg from '../../static/img/spinning-progress-black.png';

type Props = {|
  color: string,
  size: number,
|};

/**
 * Renders a progress indicator - light circle and a darker
 * quarter of a circle overlapping it, spinning.
 *
 * This is a temporary replacement of the ART-based SpinningProgress.
 *
 * @prop color - The color of the circle. Works only for 'black' and 'default'.
 * @prop size - Diameter of the circle in pixels.
 */
export default class SpinningProgress extends React.PureComponent<Props> {
  render() {
    const { color, size } = this.props;
    const style = { width: size, height: size };
    const source = color === '0, 0, 0' ? spinningProgressBlackImg : spinningProgressImg;

    return (
      <AnimatedRotateComponent>
        <Image style={style} source={source} resizeMode="contain" />
      </AnimatedRotateComponent>
    );
  }
}
