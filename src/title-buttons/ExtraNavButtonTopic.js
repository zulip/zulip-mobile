/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, Narrow, Stream } from '../types';
import connectWithActions from '../connectWithActions';
import { getStreams } from '../selectors';
import { streamNarrow } from '../utils/narrow';
import NavButton from '../nav/NavButton';

type Props = {
  actions: Actions,
  narrow: Narrow,
  color: string,
  streams: Stream[],
};

class ExtraNavButtonTopic extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { actions, narrow, streams } = this.props;
    const stream = streams.find(x => x.name === narrow[0].operand);
    if (stream) {
      actions.doNarrow(streamNarrow(stream.name));
    }
  };

  render() {
    const { color } = this.props;

    return <NavButton name="arrow-up" color={color} onPress={this.handlePress} />;
  }
}

export default connectWithActions((state, props) => ({
  streams: getStreams(state),
}))(ExtraNavButtonTopic);
