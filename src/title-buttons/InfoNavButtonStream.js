/* @flow strict-local */

import React from 'react';

import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, Narrow, Stream } from '../types';
import { connect } from '../react-redux';
import { getStreams } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToStream } from '../actions';
import { streamNameOfNarrow } from '../utils/narrow';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  narrow: Narrow,
  color: string,
  streams: Stream[],
|}>;

function InfoNavButtonStream(props: Props) {
  const { color } = props;

  return (
    <NavButton
      name="info"
      color={color}
      onPress={() => {
        const { narrow, streams } = props;
        const streamName = streamNameOfNarrow(narrow);
        const stream = streams.find(x => x.name === streamName);
        if (stream) {
          NavigationService.dispatch(navigateToStream(stream.stream_id));
        }
      }}
    />
  );
}

export default connect(state => ({
  streams: getStreams(state),
}))(InfoNavButtonStream);
