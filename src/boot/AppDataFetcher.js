/* @flow strict-local */

import React from 'react';

import type { Node as React$Node } from 'react';
import { useSelector, useDispatch } from '../react-redux';
import { getSession } from '../directSelectors';
import { doInitialFetch } from '../actions';

type Props = $ReadOnly<{|
  children: React$Node,
|}>;

export default function AppDataFetcher(props: Props): React$Node {
  const needsInitialFetch = useSelector(state => getSession(state).needsInitialFetch);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (needsInitialFetch) {
      dispatch(doInitialFetch());
    }
  }, [needsInitialFetch, dispatch]);

  return props.children;
}
