/* @flow */
import React, { PureComponent } from 'react';

import type { StyleObj } from '../types';
import { SlideAnimationView } from '../common';
import LightboxFooter from './LightboxFooter';

type Props = {
  style: StyleObj,
  displayMessage: string,
  from: number,
  to: number,
  onOptionsPress: () => void,
};

export default class AnimatedLightboxFooter extends PureComponent<Props> {
  render() {
    const { displayMessage, onOptionsPress, style, ...restProps } = this.props;
    return (
      <SlideAnimationView property="translateY" style={style} {...restProps}>
        <LightboxFooter displayMessage={displayMessage} onOptionsPress={onOptionsPress} />
      </SlideAnimationView>
    );
  }
}
