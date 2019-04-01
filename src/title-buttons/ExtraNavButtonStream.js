/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch, Narrow, Stream } from '../types';
import { getStreams } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToTopicList } from '../actions';

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

class ExtraNavButtonStream extends PureComponent<Props> {
  handlePress = () => {
    const { dispatch, narrow, streams } = this.props;
    const stream = streams.find(x => x.name === narrow[0].operand);
    if (stream) {
      dispatch(navigateToTopicList(stream.stream_id));
    }
  };

  render() {
    const { color } = this.props;

    return <NavButton name="list" color={color} onPress={this.handlePress} />;
  }
}

export default connect((state, props) => ({
  streams: getStreams(state),
}))(ExtraNavButtonStream);
