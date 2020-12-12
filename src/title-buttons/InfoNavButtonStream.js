/* @flow strict-local */

import React, { PureComponent } from 'react';

import NavigationService from '../nav/NavigationService';
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

class InfoNavButtonStream extends PureComponent<Props> {
  handlePress = () => {
    const { narrow, streams } = this.props;
    const streamName = streamNameOfNarrow(narrow);
    const stream = streams.find(x => x.name === streamName);
    if (stream) {
      NavigationService.dispatch(navigateToStream(stream.stream_id));
    }
  };

  render() {
    const { color } = this.props;

    return <NavButton name="info" color={color} onPress={this.handlePress} />;
  }
}

export default connect(state => ({
  streams: getStreams(state),
}))(InfoNavButtonStream);
