/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Image } from 'react-native';

import AnimatedRotateComponent from '../animation/AnimatedRotateComponent';
import spinningProgressImg from '../../static/img/spinning-progress.png';
import spinningProgressBlackImg from '../../static/img/spinning-progress-black.png';
import spinningProgressWhiteImg from '../../static/img/spinning-progress-white.png';

type Props = $ReadOnly<{|
  color: 'default' | 'black' | 'white',
  size: number,
|}>;

/**
 * Renders a progress indicator - light circle and a darker
 * quarter of a circle overlapping it, spinning.
 *
 * This is a temporary replacement of the ART-based SpinningProgress.
 *
 * @prop color - The color of the circle.
 * @prop size - Diameter of the circle in pixels.
 */
export default function SpinningProgress(props: Props): Node {
  const { color, size } = props;
  const style = { width: size, height: size };
  const source = (() => {
    switch (color) {
      case 'white':
        return spinningProgressWhiteImg;
      case 'black':
        return spinningProgressBlackImg;
      default:
        return spinningProgressImg;
    }
  })();

  return (
    <AnimatedRotateComponent>
      <Image style={style} source={source} resizeMode="contain" />
    </AnimatedRotateComponent>
  );
}
