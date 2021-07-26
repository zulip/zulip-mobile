/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { Narrow } from '../types';
import { useSelector, useDispatch } from '../react-redux';
import { getStreams } from '../selectors';
import { streamNameOfNarrow, streamNarrow } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import { doNarrow } from '../actions';

type Props = $ReadOnly<{|
  narrow: Narrow,
  color: string,
|}>;

export default function ExtraNavButtonTopic(props: Props): Node {
  const { narrow, color } = props;
  const dispatch = useDispatch();
  const streams = useSelector(getStreams);

  const handlePress = useCallback(() => {
    const streamName = streamNameOfNarrow(narrow);
    const stream = streams.find(x => x.name === streamName);
    if (stream) {
      dispatch(doNarrow(streamNarrow(stream.name)));
    }
  }, [dispatch, narrow, streams]);

  return <NavButton name="arrow-up" color={color} onPress={handlePress} />;
}
