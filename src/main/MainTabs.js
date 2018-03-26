/* @flow */
import React, { PureComponent } from 'react';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import type { TabNavigationOptionsPropsType } from '../types';
import tabsOptions from '../styles/tabs';
import HomeTab from './HomeTab';
import StreamTabs from './StreamTabs';
import ConversationsContainer from '../conversations/ConversationsContainer';
import SettingsCard from '../settings/SettingsCard';
import { IconHome, IconStream, IconSettings } from '../common/Icons';
import IconUnreadConversations from '../nav/IconUnreadConversations';

export default class MainTabs extends PureComponent<> {
  render() {
    const { canGoBack, actions } = this.props;
    const Tabs = TabNavigator(
      {
        home: {
          screen: HomeTab,
          navigationOptions: {
            tabBarLabel: 'Home',
            tabBarIcon: (props: TabNavigationOptionsPropsType) => (
              <IconHome size={24} color={props.tintColor} />
            ),
          },
        },
        streams: {
          screen: props => (
            <StreamTabs
              mainTabsNavigationState={props.navigation.state}
              actions={actions}
              canGoBack={canGoBack}
            />
          ),
          navigationOptions: {
            tabBarLabel: 'Streams',
            tabBarIcon: (props: TabNavigationOptionsPropsType) => (
              <IconStream size={24} color={props.tintColor} />
            ),
          },
        },
        conversations: {
          screen: ConversationsContainer,
          navigationOptions: {
            tabBarLabel: 'Conversations',
            tabBarIcon: (props: TabNavigationOptionsPropsType) => (
              <IconUnreadConversations color={props.tintColor} />
            ),
          },
        },
        settings: {
          screen: SettingsCard,
          navigationOptions: {
            tabBarLabel: 'Settings',
            tabBarIcon: (props: TabNavigationOptionsPropsType) => (
              <IconSettings size={24} color={props.tintColor} />
            ),
          },
        },
      },
      tabsOptions({
        tabBarComponent: TabBarBottom,
        tabBarPosition: 'bottom',
        showLabel: false,
        showIcon: true,
        tabWidth: 0,
      }),
    );

    return <Tabs />;
  }
}
