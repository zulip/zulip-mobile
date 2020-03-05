/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { Dispatch, Narrow, Stream } from '../types';
import { connect } from '../react-redux';
import { getStreams } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigatePopToTop } from '../nav/navActions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  narrow: Narrow,
  color: string,
  streams: Stream[],
|}>;

class ExtraNavButtonTopic extends PureComponent<Props> {
  handlePress = () => {
    this.props.dispatch(navigatePopToTop());
  };

  render() {
    const { color } = this.props;

    return <NavButton name="home" color={color} onPress={this.handlePress} />;
  }
}

export default connect(state => ({
  streams: getStreams(state),
}))(ExtraNavButtonTopic);
