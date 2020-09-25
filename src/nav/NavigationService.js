/* @flow strict-local */
import React from 'react';
import type {
  NavigationAction,
  NavigationNavigatorProps,
  NavigationState,
  NavigationDispatch,
  SupportedThemes,
} from 'react-navigation';

type ReduxContainerProps = {
  ...$Diff<NavigationNavigatorProps<{ ... }, NavigationState>, { navigation: mixed }>,
  state: NavigationState,
  dispatch: NavigationDispatch,
  theme: SupportedThemes | 'no-preference',
};

// Should mimic return type of react-navigation-redux-helpers's
// `createReduxContainer`.
type ReduxContainer = React$Component<ReduxContainerProps>;

// TODO: This will eventually be a ref to the component instance
// created by React Navigation's `createAppContainer`, not
// react-navigation-redux-helpers's `createReduxContainer`.
const reduxContainerRef = React.createRef<ReduxContainer>();

const getState = (): NavigationState => {
  if (reduxContainerRef.current === null) {
    throw new Error('Tried to use NavigationService before reduxContainerRef was set.');
  }
  return (
    reduxContainerRef.current
      // $FlowFixMe - how to tell Flow about this method?
      .getCurrentNavigation().state
  );
};

const dispatch = (navigationAction: NavigationAction): boolean => {
  if (reduxContainerRef.current === null) {
    throw new Error('Tried to use NavigationService before reduxContainerRef was set.');
  }
  return (
    reduxContainerRef.current
      // $FlowFixMe - how to tell Flow about this method?
      .getCurrentNavigation()
      .dispatch(navigationAction)
  );
};

export default {
  getState,
  dispatch,
  reduxContainerRef,
};
