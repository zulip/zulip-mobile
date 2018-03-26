/* @flow */
import React, { PureComponent } from 'react';
import { BackHandler, StyleSheet, Text } from 'react-native';
import { TabNavigator, TabBarTop } from 'react-navigation';
import { FormattedMessage } from 'react-intl';

import type { Actions, TabNavigationOptionsPropsType } from '../types';
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

type Props = {
  actions: Actions,
  canGoBack: boolean,
  navigation: Object,
};

class StreamTabs extends PureComponent<Props> {
  props: Props;

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  handleBackButtonPress = () => {
    const { canGoBack, actions, navigation } = this.props;
    if (canGoBack) {
      actions.navigateBack();
      return canGoBack;
    } else if (!navigation.isFocused()) {
      navigation.navigate('home');
      return false;
    }
    return false;
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
