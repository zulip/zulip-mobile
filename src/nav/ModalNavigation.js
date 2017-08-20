/* TODO @flow */
import React from 'react';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import { BRAND_COLOR } from '../styles';
import ConversationsContainer from '../conversations/ConversationsContainer';
import StreamTabs from './StreamTabs';
import { IconStream } from '../common/Icons';
import IconUnreadConversations from './IconUnreadConversations';

export default TabNavigator(
  {
    streams: {
      screen: StreamTabs,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => <IconStream size={24} color={tintColor} />,
      },
    },
    conversations: {
      screen: props => <ConversationsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => <IconUnreadConversations color={tintColor} />,
      },
    },
  },
  {
    tabBarComponent: TabBarBottom,
    tabBarOptions: {
      showIcon: true,
      showLabel: false,
      activeTintColor: BRAND_COLOR,
      inactiveTintColor: 'rgba(82, 194, 175, 0.5)',
      style: {
        backgroundColor: 'white',
      },
    },
  },
);
