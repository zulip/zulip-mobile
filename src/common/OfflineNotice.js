/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { GlobalState } from '../types';
import { getSession } from '../selectors';
import Notice from './Notice';

type Props = {
  isOnline: boolean,
};

/**
 * Displays a notice that the app is working in offline mode.
 * Not rendered if state is 'online'.
 *
 * @prop isOnline - Provide the online/offline state.
 */
class OfflineNotice extends PureComponent<Props> {
  props: Props;

  render() {
    const { isOnline } = this.props;
    return <Notice visible={!isOnline} text="No Internet connection" />;
  }
}

export default connect((state: GlobalState) => ({
  isOnline: getSession(state).isOnline,
}))(OfflineNotice);
