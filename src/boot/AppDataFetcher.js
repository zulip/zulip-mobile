/* @flow strict-local */

import { PureComponent } from 'react';

import type { Node as React$Node } from 'react';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { getSession } from '../directSelectors';
import { doInitialFetch } from '../actions';

type Props = $ReadOnly<{|
  needsInitialFetch: boolean,
  dispatch: Dispatch,
  children: React$Node,
|}>;

class AppDataFetcher extends PureComponent<Props> {
  componentDidUpdate() {
    const { dispatch, needsInitialFetch } = this.props;

    if (needsInitialFetch) {
      dispatch(doInitialFetch());
    }
  }

  componentDidMount() {
    const { dispatch, needsInitialFetch } = this.props;

    if (needsInitialFetch) {
      dispatch(doInitialFetch());
    }
  }

  render() {
    return this.props.children;
  }
}

export default connect(state => ({
  needsInitialFetch: getSession(state).needsInitialFetch,
}))(AppDataFetcher);
