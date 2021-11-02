/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import { useSelector } from '../react-redux';
import { getIsHydrated } from '../selectors';

type Props = $ReadOnly<{|
  children: Node,

  PlaceholderComponent?: React$ComponentType<{||}>,
|}>;

export default function HideIfNotHydrated(props: Props): Node {
  const isHydrated = useSelector(getIsHydrated);

  const { children, PlaceholderComponent } = props;

  if (!isHydrated) {
    return PlaceholderComponent ? <PlaceholderComponent /> : null;
  }

  return children;
}
