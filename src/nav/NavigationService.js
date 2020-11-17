/* @flow strict-local */
import React from 'react';
import type {
  NavigationAction,
  NavigationState,
  NavigationContainer,
  NavigationContainerProps,
} from 'react-navigation';

/* prettier-ignore */
export const appContainerRef = React.createRef<
  React$ElementRef<
    NavigationContainer<
      NavigationState,
      { ... },
      NavigationContainerProps<{ ... }, NavigationState>>>
>();

export const getState = (): NavigationState => {
  if (appContainerRef.current === null) {
    throw new Error('Tried to use NavigationService before appContainerRef was set.');
  }
  // https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/decouple.20nav.20from.20redux.20%28.23M3804%29/near/1056167
  // $FlowFixMe
  return appContainerRef.current.state.nav;
};

export const dispatch = (navigationAction: NavigationAction): boolean => {
  if (appContainerRef.current === null) {
    throw new Error('Tried to use NavigationService before appContainerRef was set.');
  }
  return appContainerRef.current.dispatch(navigationAction);
};
