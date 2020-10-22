/* @flow strict-local */

import React from 'react';

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

function AppDataFetcher(props: Props) {
  const { needsInitialFetch, dispatch } = props;

  React.useEffect(() => {
    if (needsInitialFetch) {
      dispatch(doInitialFetch());
    }
  }, [needsInitialFetch, dispatch]);

  return props.children;
}

export default connect(state => ({
  needsInitialFetch: getSession(state).needsInitialFetch,
}))(AppDataFetcher);
