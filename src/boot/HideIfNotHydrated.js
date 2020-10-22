/* @flow strict-local */
import React, { type Node as React$Node } from 'react';
import { useSelector } from 'react-redux';

import { getIsHydrated } from '../selectors';

type Props = $ReadOnly<{|
  children: React$Node,

  PlaceholderComponent?: React$ComponentType<{||}>,
|}>;

export default function HideIfNotHydrated(props: Props) {
  const isHydrated = useSelector(getIsHydrated);

  const { children, PlaceholderComponent } = props;

  if (!isHydrated) {
    return PlaceholderComponent ? <PlaceholderComponent /> : null;
  }

  return children;
}
