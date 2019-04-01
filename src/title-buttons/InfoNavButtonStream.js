/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch, Narrow, Stream } from '../types';
import { getStreams } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToStream } from '../actions';

type OwnProps = {|
  narrow: Narrow,
  color: string,
|};

type StateProps = {|
  dispatch: Dispatch,
  streams: Stream[],
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
|};

class InfoNavButtonStream extends PureComponent<Props> {
  handlePress = () => {
    const { dispatch, narrow, streams } = this.props;
    const stream = streams.find(x => x.name === narrow[0].operand);
    if (stream) {
      dispatch(navigateToStream(stream.stream_id));
    }
  };

  render() {
    const { color } = this.props;

    return <NavButton name="info" color={color} onPress={this.handlePress} />;
  }
}

export default connect((state, props) => ({
  streams: getStreams(state),
}))(InfoNavButtonStream);
