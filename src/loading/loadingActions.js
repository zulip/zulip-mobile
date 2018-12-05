/* @flow */
import type { LoadingStartAction, LoadingCompleteAction } from '../types';
import { LOADING_START, LOADING_COMPLETE } from '../actionConstants';

export const startLoading = (entity: string): LoadingStartAction => ({
  type: LOADING_START,
  entity,
});

export const loadingComplete = (entity: string): LoadingCompleteAction => ({
  type: LOADING_COMPLETE,
  entity,
});
