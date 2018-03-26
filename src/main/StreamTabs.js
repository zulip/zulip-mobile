/* @flow */
import React, { PureComponent } from 'react';
import { BackHandler, StyleSheet, Text } from 'react-native';
import { TabNavigator, TabBarTop } from 'react-navigation';
import { FormattedMessage } from 'react-intl';

import type { TabNavigationOptionsPropsType } from '../types';
import connectWithActions from '../connectWithActions';
import { getCanGoBack } from '../selectors';
import tabsOptions from '../styles/tabs';
import SubscriptionsContainer from '../streams/SubscriptionsContainer';
import StreamListContainer from '../subscriptions/StreamListContainer';

const styles = StyleSheet.create({
  tab: {
    padding: 10,
    fontSize: 16,
  },
});

class StreamTabs extends PureComponent<> {
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
    }
    return canGoBack;
  };

  render() {
    return <Tabs />;
  }
}
const Tabs = TabNavigator(
  {
    subscribed: {
      screen: SubscriptionsContainer,
      navigationOptions: {
        tabBarLabel: (props: TabNavigationOptionsPropsType) => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="Subscribed" defaultMessage="Subscribed" />
          </Text>
        ),
      },
    },
    allStreams: {
      screen: StreamListContainer,
      navigationOptions: {
        tabBarLabel: (props: TabNavigationOptionsPropsType) => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="All streams" defaultMessage="All streams" />
          </Text>
        ),
      },
    },
  },
  tabsOptions({
    tabBarComponent: TabBarTop,
    tabBarPosition: 'top',
    showLabel: true,
    showIcon: false,
    tabWidth: 100,
  }),
);

export default connectWithActions(state => ({
  canGoBack: getCanGoBack(state),
}))(StreamTabs);
