/* @flow strict-local */
import React from 'react';
import type {
  GenericNavigationAction,
  NavigationState,
  NavigationContainerType,
} from '@react-navigation/native';

export const isReadyRef = React.createRef<boolean>();
export const navigationContainerRef = React.createRef<React$ElementRef<NavigationContainerType>>();

const getContainer = () => {
  if (navigationContainerRef.current === null) {
    throw new Error('Tried to use NavigationService before `navigationContainerRef` was set.');
  }
  if (isReadyRef.current !== true) {
    throw new Error('Tried to use NavigationService before `NavigationContainer` was ready.');
  }
  return navigationContainerRef.current;
};

export const getState = (): NavigationState => getContainer().getRootState();

export const dispatch = (navigationAction: GenericNavigationAction): void =>
  getContainer().dispatch(navigationAction);
