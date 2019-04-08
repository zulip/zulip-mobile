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
