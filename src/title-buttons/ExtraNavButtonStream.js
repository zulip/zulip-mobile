/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, Narrow, Stream } from '../types';
import connectWithActions from '../connectWithActions';
import { getStreams } from '../selectors';
import NavButton from '../nav/NavButton';

type Props = {
  actions: Actions,
  narrow: Narrow,
  color: string,
  streams: Stream[],
};

class ExtraNavButtonStream extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { actions, narrow, streams } = this.props;
    const stream = streams.find(x => x.name === narrow[0].operand);
    if (stream) {
      actions.navigateToTopicList(stream.stream_id);
    }
  };

  render() {
    const { color } = this.props;

    return <NavButton name="list" color={color} onPress={this.handlePress} />;
  }
}

export default connectWithActions((state, props) => ({
  streams: getStreams(state),
}))(ExtraNavButtonStream);
