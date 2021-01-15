/* @flow strict-local */

import React from 'react';

import * as NavigationService from '../nav/NavigationService';
import type { Narrow } from '../types';
import { useSelector } from '../react-redux';
import { getStreams } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToStream } from '../actions';
import { streamNameOfNarrow } from '../utils/narrow';

type Props = $ReadOnly<{|
  narrow: Narrow,
  color: string,
|}>;

export default function InfoNavButtonStream(props: Props) {
  const streams = useSelector(getStreams);
  const { color } = props;

  return (
    <NavButton
      name="info"
      color={color}
      onPress={() => {
        const { narrow } = props;
        const streamName = streamNameOfNarrow(narrow);
        const stream = streams.find(x => x.name === streamName);
        if (stream) {
          NavigationService.dispatch(navigateToStream(stream.stream_id));
        }
      }}
    />
  );
}
