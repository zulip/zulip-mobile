/* @flow */
import React from 'react';
import { Platform } from 'react-native';
import { DrawerNavigator } from 'react-navigation';

import MainTabsWithAppBar from './MainTabsWithAppBar';
import Sidebar from '../nav/Sidebar';
import SettingsCard from '../settings/SettingsCard';
import { IconSettings } from '../common/Icons';

export default DrawerNavigator(
  {
    Home: {
      screen: MainTabsWithAppBar,
    },
  },
  {
    contentComponent: Sidebar,
  },
);
