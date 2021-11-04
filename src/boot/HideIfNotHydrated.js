/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import { useGlobalSelector } from '../react-redux';
import { getIsHydrated } from '../selectors';

type Props = $ReadOnly<{|
  children: Node,

  PlaceholderComponent?: React$ComponentType<{||}>,
|}>;

export default function HideIfNotHydrated(props: Props): Node {
  const isHydrated = useGlobalSelector(getIsHydrated);

  const { children, PlaceholderComponent } = props;

  if (!isHydrated) {
    return PlaceholderComponent ? <PlaceholderComponent /> : null;
  }

  return children;
}
