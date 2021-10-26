import React from 'react'

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import MainTabsScreen from './MainTabsScreen'
import { useHaveServerDataGate } from '../withHaveServerDataGate';
import DrawerContent from '../drawerContent/DrawerContent'

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
    return (
        <Drawer.Navigator
            initialRouteName="MainTabsScreen"
            drawerContent={props => <DrawerContent {...props} />}
        >
            <Drawer.Screen name="MainTabsScreen" component={useHaveServerDataGate(MainTabsScreen)} />
            {/* <Drawer.Screen name="Notifications" component={NotificationsScreen} /> */}
        </Drawer.Navigator>
    );
}

export default DrawerNavigation