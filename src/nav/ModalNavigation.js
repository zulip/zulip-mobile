/* TODO @flow */
import React, { PureComponent } from 'react';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import { View, StyleSheet } from 'react-native';

import { BRAND_COLOR, STATUSBAR_HEIGHT } from '../styles';
import ConversationsContainer from '../conversations/ConversationsContainer';
import StreamTabs from './StreamTabs';
import { IconStream, IconCancel } from '../common/Icons';
import Touchable from '../common/Touchable';
import IconUnreadConversations from './IconUnreadConversations';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: STATUSBAR_HEIGHT,
    flexDirection: 'column',
    backgroundColor: '#FFF',
  },
  closeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});

export const ModalNavigationTabs = TabNavigator(
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

export default class ModalNavigation extends PureComponent {
  closeNavigationModal = () => this.props.navigation.goBack();

  render() {
    return (
      <View style={styles.container}>
        <Touchable onPress={this.closeNavigationModal} style={styles.closeIcon}>
          <IconCancel color={BRAND_COLOR} size={24} />
        </Touchable>
        <ModalNavigationTabs screenProps={{ onNarrow: this.closeNavigationModal }} />
      </View>
    );
  }
}
