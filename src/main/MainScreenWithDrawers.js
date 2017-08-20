/* TODO flow */
import React, { PureComponent } from 'react';
import { DrawerNavigator } from 'react-navigation';

import MainScreen from './MainScreen';
import StreamSidebar from '../nav/StreamSidebar';

export const LeftDrawer = DrawerNavigator(
  {
    main: {
      screen: props => <MainScreen navigation={props.navigation} />,
    },
  },
  {
    contentComponent: props => <StreamSidebar navigation={props.navigation} />,
    initialRouteName: 'main',
  },
);

export default class MainScreenWithDrawers extends PureComponent {
  render() {
    return <LeftDrawer />;
  }
}
