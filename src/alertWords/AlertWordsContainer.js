/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import AlertWordsList from './AlertWordsList';
import { getAlertWords, getAuth } from '../selectors';

class MutedTopicContainer extends PureComponent {
  render() {
    const { alertWords, auth } = this.props;
    return <AlertWordsList alertWords={alertWords} auth={auth} />;
  }
}

export default connect((state: GlobalState) => ({
  alertWords: getAlertWords(state),
  auth: getAuth(state),
}))(MutedTopicContainer);
