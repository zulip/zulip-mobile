/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import { useGlobalSelector } from '../react-redux';
import { getIsHydrated } from '../selectors';
import FullScreenLoading from '../common/FullScreenLoading';

type Props = $ReadOnly<{|
  children: Node,
|}>;

/**
 * Where we prevent everything from rendering while waiting for rehydration.
 */
export default function StoreHydratedGate(props: Props): Node {
  const { children } = props;

  const isHydrated = useGlobalSelector(getIsHydrated);

  return isHydrated ? children : <FullScreenLoading />;
}
