/* @flow strict-local */
import type { ComponentType, ElementConfig } from 'react';
import { connect as connectInner } from 'react-redux';

import type { GlobalState } from './types';

export const connect: <
  C: ComponentType<*>,
  // S == GlobalState
  SP: {},
  RSP: {},
  CP: $Diff<$Diff<ElementConfig<C>, { dispatch: mixed }>, RSP>,
  // ST ignore
>(
  mapStateToProps?: (GlobalState, SP) => RSP,
) => C => ComponentType<CP & SP> = mapStateToProps => connectInner(mapStateToProps);

/**
 * DEPRECATED.  Don't add new uses; and PRs to remove existing uses are welcome.
 *
 * This is exactly like `connect` except with type-checking disabled.
 * Any place we use it, it's because there's a type error there.
 * To fix: change the call site to use `connect`; see what error Flow
 * reports; and fix the error.
 *
 * (Backstory: for a long time `connect` had a type that partly defeated
 * type-checking, so we accumulated a number of type errors that that hid.
 * This untyped version lets us fix those errors one by one, while using the
 * new, well-typed `connect` everywhere else.)
 */
export const connectFlowFixMe = (mapStateToProps: $FlowFixMe) => (c: $FlowFixMe) =>
  connect(mapStateToProps)(c);
