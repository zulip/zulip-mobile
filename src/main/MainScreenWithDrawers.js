/* @TODO flow */
import React, { PureComponent } from 'react';
import { DrawerNavigator } from 'react-navigation';

import MainScreen from './MainScreen';
import Sidebar from '../nav/Sidebar';

export const Drawer = DrawerNavigator(
  {
    main: {
      screen: props => <MainScreen navigation={props.navigation} />,
    },
  },
  {
    contentComponent: props => <Sidebar navigation={props.navigation} />,
    initialRouteName: 'main',
    drawerWidth: 300,
    drawerOpenRoute: 'DrawerOpen',
    drawerCloseRoute: 'DrawerClose',
    drawerToggleRoute: 'DrawerToggle',
  },
);

export default class MainScreenWithDrawers extends PureComponent<{}> {
  render() {
    return <Drawer />;
  }
}
