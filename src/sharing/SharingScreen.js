/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import {
  createMaterialTopTabNavigator,
  type NavigationTabProp,
  type NavigationStateRoute,
} from 'react-navigation-tabs';
import { FormattedMessage } from 'react-intl';

import type { GlobalParamList } from '../nav/globalTypes';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, Auth, SharedData } from '../types';
import { createStyleSheet } from '../styles';
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { tryGetAuth } from '../selectors';
import { navigateToAccountPicker } from '../nav/navActions';
import ShareToStream from './ShareToStream';
import ShareToPm from './ShareToPm';

export type SharingNavigatorParamList = {|
  'share-to-stream': {| sharedData: SharedData |},
  'share-to-pm': {| sharedData: SharedData |},
|};

export type SharingNavigationProp<
  RouteName: $Keys<SharingNavigatorParamList> = $Keys<SharingNavigatorParamList>,
> = NavigationTabProp<{|
  ...NavigationStateRoute,
  params: $ElementType<GlobalParamList, RouteName>,
|}>;

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'sharing'>,

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
    'share-to-stream': {
      // $FlowFixMe react-navigation types are twisty and seem wrong
      screen: ShareToStream,
      navigationOptions: {
        tabBarLabel: props => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="Stream" defaultMessage="Stream" />
          </Text>
        ),
      },
    },
    'share-to-pm': {
      // $FlowFixMe react-navigation types are twisty and seem wrong
      screen: ShareToPm,
      navigationOptions: {
        tabBarLabel: props => (
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
    const { auth, navigation } = this.props;

    // If there is no active logged-in account, abandon the sharing attempt,
    // and present the account picker screen to the user.
    if (auth === undefined) {
      NavigationService.dispatch(navigateToAccountPicker());
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
