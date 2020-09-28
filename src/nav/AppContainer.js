/* @flow strict-local */
import { createAppContainer } from 'react-navigation';
import type { NavigationState } from 'react-navigation';

import AppNavigator from './AppNavigator';

export default createAppContainer<NavigationState, { ... }>(AppNavigator);
