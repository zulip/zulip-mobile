/* @flow */
import type { GlobalState } from '../types';

export const getPushToken = (state: GlobalState): string => state.realm.pushToken.token;
