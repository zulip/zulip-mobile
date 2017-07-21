/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getActiveNarrow, getUnreadStreamsAndTopics } from '../selectors';
import UnreadStreamsCard from './UnreadStreamsCard';

class UnreadStreamsContainer extends PureComponent {
  render() {
    return <UnreadStreamsCard {...this.props} />;
  }
}

export default connect(
  state => ({
    narrow: getActiveNarrow(state),
    unreadStreamsAndTopics: getUnreadStreamsAndTopics(state),
  }),
  boundActions,
)(UnreadStreamsContainer);
