/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch, Narrow, Stream } from '../types';
import { getStreams } from '../selectors';
import { streamNarrow } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import { doNarrow } from '../actions';

type Props = {
  dispatch: Dispatch,
  narrow: Narrow,
  color: string,
  streams: Stream[],
};

class ExtraNavButtonTopic extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { dispatch, narrow, streams } = this.props;
    const stream = streams.find(x => x.name === narrow[0].operand);
    if (stream) {
      dispatch(doNarrow(streamNarrow(stream.name)));
    }
  };

  render() {
    const { color } = this.props;

    return (
      <NavButton
        accessibilityLabel="Narrow to stream"
        name="arrow-up"
        color={color}
        onPress={this.handlePress}
      />
    );
  }
}

export default connect((state, props) => ({
  streams: getStreams(state),
}))(ExtraNavButtonTopic);
