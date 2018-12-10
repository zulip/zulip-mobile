/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { Style } from '../types';
import { SlideAnimationView } from '../common';
import { shortTime, humanDate } from '../utils/date';
import LightboxHeader from './LightboxHeader';

type Props = {
  senderName: string,
  timestamp: number,
  from: number,
  to: number,
  style: Style,
  avatarUrl: string,
  realm: string,
  onPressBack: () => void,
};

export default class AnimatedLightboxHeader extends PureComponent<Props> {
  render() {
    const { onPressBack, senderName, timestamp, ...restProps } = this.props;
    const displayDate = humanDate(new Date(timestamp * 1000));
    const time = shortTime(new Date(timestamp * 1000));
    const subheader = `${displayDate} at ${time}`;

    return (
      <SlideAnimationView property="translateY" {...restProps}>
        <LightboxHeader
          onPressBack={onPressBack}
          senderName={senderName}
          timestamp={timestamp}
          subheader={subheader}
          {...restProps}
        />
      </SlideAnimationView>
    );
  }
}
