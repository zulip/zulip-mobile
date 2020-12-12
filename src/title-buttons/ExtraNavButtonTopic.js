/* @flow strict-local */

import React, { PureComponent } from 'react';

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

class ExtraNavButtonTopic extends PureComponent<Props> {
  handlePress = () => {
    const { dispatch, narrow, streams } = this.props;
    const streamName = streamNameOfNarrow(narrow);
    const stream = streams.find(x => x.name === streamName);
    if (stream) {
      dispatch(doNarrow(streamNarrow(stream.name)));
    }
  };

  render() {
    const { color } = this.props;

    return <NavButton name="arrow-up" color={color} onPress={this.handlePress} />;
  }
}

export default connect(state => ({
  streams: getStreams(state),
}))(ExtraNavButtonTopic);
