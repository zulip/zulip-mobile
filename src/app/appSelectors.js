/* @flow */
import type { GlobalState } from '../types';

export const getAppHydrated = (state: GlobalState) => state.app.isHydrated;
