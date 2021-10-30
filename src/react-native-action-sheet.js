/* @flow strict-local */
import type { ComponentType, ElementConfig } from 'react';
// $FlowFixMe[untyped-import]
import { connectActionSheet as connectActionSheetInner } from '@expo/react-native-action-sheet';

import type { BoundedDiff } from './generics';

/* eslint-disable flowtype/generic-spacing */

export type ShowActionSheetWithOptions = (
  { options: string[], cancelButtonIndex: number, ... },
  (number) => void,
) => void;

/**
 * Exactly like the `connectActionSheet` in
 *   `react-native-action-sheet` upstream, but more typed.
 */
export function connectActionSheet<P, C: ComponentType<P>>(
  WrappedComponent: C,
): ComponentType<
  BoundedDiff<
    $Exact<ElementConfig<C>>,
    {| +showActionSheetWithOptions: ShowActionSheetWithOptions |},
  >,
> {
  return connectActionSheetInner(WrappedComponent);
}
