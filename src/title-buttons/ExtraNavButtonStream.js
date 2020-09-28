/* @flow strict-local */

import React, { PureComponent } from 'react';

import NavigationService from '../nav/NavigationService';
import type { Dispatch, Narrow, Stream } from '../types';
import { connect } from '../react-redux';
import { getStreams } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToTopicList } from '../actions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  narrow: Narrow,
  color: string,
  streams: Stream[],
|}>;

class ExtraNavButtonStream extends PureComponent<Props> {
  handlePress = () => {
    const { narrow, streams } = this.props;
    const stream = streams.find(x => x.name === narrow[0].operand);
    if (stream) {
      NavigationService.dispatch(navigateToTopicList(stream.stream_id));
    }
  };

  render() {
    const { color } = this.props;

    return <NavButton name="list" color={color} onPress={this.handlePress} />;
  }
}

export default connect(state => ({
  streams: getStreams(state),
}))(ExtraNavButtonStream);
