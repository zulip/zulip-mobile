/* @flow strict-local */
import type { GlobalState } from '../types';

export const getPushToken = (state: GlobalState): string | null => state.realm.pushToken.token;
