/* @flow */
import React, { PureComponent } from 'react';
import { BackHandler } from 'react-native';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import type { Actions, NavigationScreenPropsType, TabNavigationOptionsPropsType } from '../types';
import connectWithActions from '../connectWithActions';
import { getCanGoBack } from '../selectors';
import tabsOptions from '../styles/tabs';
import HomeTab from './HomeTab';
import StreamTabs from './StreamTabs';
import ConversationsContainer from '../conversations/ConversationsContainer';
import SettingsCard from '../settings/SettingsCard';
import { IconHome, IconStream, IconSettings } from '../common/Icons';
import IconUnreadConversations from '../nav/IconUnreadConversations';

type Props = {
  actions: Actions,
  canGoBack: boolean,
};

class MainTabs extends PureComponent<Props> {
  props: Props;

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  handleBackButtonPress = () => {
    const { canGoBack, actions } = this.props;
    if (canGoBack) {
      actions.navigateBack();
      return canGoBack;
    }
    return canGoBack;
  };

  render() {
    return <Tabs />;
  }
}

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
      screen: (props: NavigationScreenPropsType) => <StreamTabs {...props} />,
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

export default connectWithActions(state => ({
  canGoBack: getCanGoBack(state),
}))(MainTabs);
