/* @flow strict-local */
import {
  type StackActionType,
  StackActions,
  CommonActions,
  type NavigationAction,
} from '@react-navigation/native';

import * as NavigationService from './NavigationService';
import type { Narrow } from '../types';
import type { SharedData } from '../sharing/types';

// TODO: Probably just do a StackActions.pop()?
export const navigateBack = (): StackActionType => {
  const routes = NavigationService.getState().routes;
  let i = routes.length - 1;
  while (i >= 0) {
    if (routes[i].name !== routes[routes.length - 1].name) {
      break;
    }
    i--;
  }
  const sameRoutesCount = routes.length - i - 1;
  return StackActions.pop(sameRoutesCount);
};

/*
 * "Reset" actions, to explicitly prohibit back navigation.
 */

export const resetToAccountPicker = (): NavigationAction =>
  CommonActions.reset({ index: 0, routes: [{ name: 'account-pick' }] });

export const resetToMainTabs = (): NavigationAction =>
  CommonActions.reset({ index: 0, routes: [{ name: 'main-tabs' }] });

/*
 * Ordinary "push" actions that will push to the stack.
 */

/** Only call this via `doNarrow`.  See there for details. */
export const navigateToChat = (narrow: Narrow): NavigationAction =>
  // This route name 'chat' appears in one more place than usual: doEventActionSideEffects.js .
  StackActions.push('chat', { narrow, editMessage: null });

export const replaceWithChat = (narrow: Narrow): NavigationAction =>
  StackActions.replace('chat', { narrow, editMessage: null });

export const navigateToSharing = (sharedData: SharedData): NavigationAction =>
  StackActions.push('sharing', { sharedData });
