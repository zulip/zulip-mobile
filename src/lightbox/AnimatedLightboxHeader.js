/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { Style } from '../types';
import { SlideAnimationView } from '../common';
import LightboxHeader from './LightboxHeader';

type Props = {
  senderName: string,
  timestamp: number,
  from: number,
  to: number,
  style: Style,
  avatarUrl: string,
  onPressBack: () => void,
};

export default class AnimatedLightboxHeader extends PureComponent<Props> {
  render() {
    const { onPressBack, senderName, timestamp, avatarUrl, ...restProps } = this.props;

    return (
      <SlideAnimationView property="translateY" {...restProps}>
        <LightboxHeader
          onPressBack={onPressBack}
          senderName={senderName}
          timestamp={timestamp}
          avatarUrl={avatarUrl}
        />
      </SlideAnimationView>
    );
  }
}
