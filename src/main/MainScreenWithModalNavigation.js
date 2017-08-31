/* TODO flow */
import React, { PureComponent } from 'react';
import { StackNavigator } from 'react-navigation';

import MainScreen from './MainScreen';
import ModalNavigation from '../nav/ModalNavigation';

export const ModalNavigator = StackNavigator(
  {
    main: {
      screen: MainScreen,
    },
    nav: {
      screen: ModalNavigation,
    },
  },
  {
    mode: 'modal',
    headerMode: 'none',
    initialRouteName: 'main',
  },
);

export default class MainScreenWithModalNavigation extends PureComponent {
  render() {
    return <ModalNavigator />;
  }
}
