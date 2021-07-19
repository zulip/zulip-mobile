/* @flow strict-local */

import React, { useCallback } from 'react';

import type { Dispatch, Narrow, Stream } from '../types';
import { connect } from '../react-redux';
import { getStreams } from '../selectors';
import { streamNameOfNarrow, streamNarrow } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import { doNarrow } from '../actions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  narrow: Narrow,
  color: string,
  streams: Stream[],
|}>;

function ExtraNavButtonTopic(props: Props) {
  const { dispatch, narrow, streams, color } = props;

  const handlePress = useCallback(() => {
    const streamName = streamNameOfNarrow(narrow);
    const stream = streams.find(x => x.name === streamName);
    if (stream) {
      dispatch(doNarrow(streamNarrow(stream.name)));
    }
  }, [dispatch, narrow, streams]);

  return <NavButton name="arrow-up" color={color} onPress={handlePress} />;
}

export default connect(state => ({
  streams: getStreams(state),
}))(ExtraNavButtonTopic);
