/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { InjectedDispatch, Narrow, Stream } from '../types';
import { connect } from '../react-redux';
import { getStreams } from '../selectors';
import { streamNarrow } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import { doNarrow } from '../actions';

type OwnProps = {|
  narrow: Narrow,
  color: string,
|};

type SelectorProps = {|
  streams: Stream[],
|};

type Props = {|
  ...InjectedDispatch,
  ...OwnProps,
  ...SelectorProps,
|};

class ExtraNavButtonTopic extends PureComponent<Props> {
  handlePress = () => {
    const { dispatch, narrow, streams } = this.props;
    const stream = streams.find(x => x.name === narrow[0].operand);
    if (stream) {
      dispatch(doNarrow(streamNarrow(stream.name)));
    }
  };

  render() {
    const { color } = this.props;

    return <NavButton name="arrow-up" color={color} onPress={this.handlePress} />;
  }
}

export default connect((state, props) => ({
  streams: getStreams(state),
}))(ExtraNavButtonTopic);
