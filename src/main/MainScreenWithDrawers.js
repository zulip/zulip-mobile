/* @TODO flow */
import React, { PureComponent } from 'react';
import { BackHandler } from 'react-native';
import { DrawerNavigator } from 'react-navigation';

import MainScreen from './MainScreen';
import Sidebar from '../nav/Sidebar';
import connectWithActions from '../connectWithActions';
import { getCanGoBack } from '../selectors';

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

class MainScreenWithDrawers extends PureComponent<{}> {
  componentDidMount() {
    // to ovveride with TabsNavigator
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  handleBackButtonPress = () => {
    const { canGoBack, actions } = this.props;
    if (canGoBack) {
      actions.navigateBack();
    }
    return canGoBack;
  };

  render() {
    return <Drawer />;
  }
}

export default connectWithActions(state => ({
  nav: state.nav,
  canGoBack: getCanGoBack(state),
}))(MainScreenWithDrawers);
