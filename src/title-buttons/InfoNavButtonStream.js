/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch, Narrow, Stream } from '../types';
import { getStreams } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToStream } from '../actions';

type Props = {
  dispatch: Dispatch,
  narrow: Narrow,
  color: string,
  streams: Stream[],
};

class InfoNavButtonStream extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { dispatch, narrow, streams } = this.props;
    const stream = streams.find(x => x.name === narrow[0].operand);
    if (stream) {
      dispatch(navigateToStream(stream.stream_id));
    }
  };

  render() {
    const { color } = this.props;

    return (
      <NavButton
        accessibilityLabel="Stream details"
        name="info"
        color={color}
        onPress={this.handlePress}
      />
    );
  }
}

export default connect((state, props) => ({
  streams: getStreams(state),
}))(InfoNavButtonStream);
