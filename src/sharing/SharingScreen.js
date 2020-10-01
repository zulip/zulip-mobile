/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { FormattedMessage } from 'react-intl';
import type { Dispatch, SharedData, Auth, TabNavigationOptionsPropsType } from '../types';
import { createStyleSheet } from '../styles';
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { tryGetAuth } from '../selectors';
import { navigateToAccountPicker } from '../nav/navActions';
import ShareToStream from './ShareToStream';
import ShareToPm from './ShareToPm';

type Props = $ReadOnly<{|
  navigation: NavigationScreenProp<{ params: {| sharedData: SharedData |} }>,
  auth: Auth | void,
  dispatch: Dispatch,
|}>;

const styles = createStyleSheet({
  tab: {
    padding: 8,
    fontSize: 16,
  },
});

const SharingTopTabNavigator = createMaterialTopTabNavigator(
  {
    subscribed: {
      // $FlowFixMe react-navigation types are twisty and seem wrong
      screen: ShareToStream,
      navigationOptions: {
        tabBarLabel: (props: TabNavigationOptionsPropsType) => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="Stream" defaultMessage="Stream" />
          </Text>
        ),
      },
    },
    allStreams: {
      // $FlowFixMe react-navigation types are twisty and seem wrong
      screen: ShareToPm,
      navigationOptions: {
        tabBarLabel: (props: TabNavigationOptionsPropsType) => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="Private Message" defaultMessage="Private Message" />
          </Text>
        ),
      },
    },
  },
  {
    ...materialTopTabNavigatorConfig({
      showLabel: true,
      showIcon: false,
    }),
    swipeEnabled: true,
  },
);

class SharingScreen extends PureComponent<Props> {
  static router = SharingTopTabNavigator.router;

  render() {
    const { auth, dispatch, navigation } = this.props;

    // If there is no active logged-in account, abandon the sharing attempt,
    // and present the account picker screen to the user.
    if (auth === undefined) {
      dispatch(navigateToAccountPicker());
      return null;
    }

    return (
      <Screen canGoBack={false} title="Share on Zulip" shouldShowLoadingBanner={false}>
        <SharingTopTabNavigator navigation={navigation} />
      </Screen>
    );
  }
}

export default connect(state => ({
  auth: tryGetAuth(state),
}))(SharingScreen);
