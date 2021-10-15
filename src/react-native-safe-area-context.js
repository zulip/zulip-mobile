/* @flow strict-local */
import type { ComponentType, ElementConfig } from 'react';
import {
  withSafeAreaInsets as withSafeAreaInsetsInner,
  type EdgeInsets,
} from 'react-native-safe-area-context';

import type { BoundedDiff } from './generics';

/* eslint-disable flowtype/generic-spacing */

/**
 * Exactly like `withSafeAreaInsets` upstream, but properly typed.
 *
 * The correction is made here, instead of in the libdef, so that we
 * can use the handy `BoundedDiff` type, as we do in our type-wrapper
 * for react-redux's `connect`.
 */
export function withSafeAreaInsets<P, C: ComponentType<P>>(
  WrappedComponent: C,
): ComponentType<BoundedDiff<$Exact<ElementConfig<C>>, {| +insets: EdgeInsets |}>> {
  return withSafeAreaInsetsInner(WrappedComponent);
}
