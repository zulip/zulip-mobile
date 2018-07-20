/* @flow */
import React from 'react';
import { Platform } from 'react-native';
import { DrawerNavigator } from 'react-navigation';

import MainTabs from './MainTabs';
import SidebarRow from '../nav/SidebarRow';
import SettingsCard from '../settings/SettingsCard';
import { IconSettings } from '../common/Icons';

export default DrawerNavigator(
  {
    Home: {
      screen: MainTabs,
    },
    Settings: {
      screen: SettingsCard,
    },
  },
  {
    contentComponent: SidebarRow,
  },
);
