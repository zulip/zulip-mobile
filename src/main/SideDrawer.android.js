import React, { Component } from 'react';
import { DrawerLayoutAndroid } from 'react-native';

export default class SideDrawer extends Component {

  componentWillReceiveProps(nextProps) {
    if (nextProps.open) {
      this.drawer.openDrawer();
    } else {
      this.drawer.closeDrawer();
    }
  }

  render() {
    const { children, side, content, onClose } = this.props;
    return (
      <DrawerLayoutAndroid
        //statusBarBackgroundColor="#dedede"
        ref={(drawer) => { this.drawer = drawer; }}
        drawerWidth={260}
        drawerPosition={(side === 'left') ? DrawerLayoutAndroid.positions.Left : DrawerLayoutAndroid.positions.Right}
        renderNavigationView={() => content}
      >
        {children}
      </DrawerLayoutAndroid>
    );
  }
}
