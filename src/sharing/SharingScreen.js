/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { NavigationScreenProp } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation';
import { BRAND_COLOR } from '../styles/constants';
import type { Dispatch, SharedData, Auth } from '../types';
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

const SharingTopTabNavigator = createMaterialTopTabNavigator(
  {
    Stream: {
      // Requires additional props that we dont need. $FlowFixMe.
      screen: ShareToStream,
    },
    'Private Message': {
      // Requires additional props that we dont need. $FlowFixMe.
      screen: ShareToPm,
    },
  },
  {
    tabBarPosition: 'top',
    animationEnabled: true,
    tabBarOptions: {
      upperCaseLabel: false,
      pressColor: BRAND_COLOR,
      activeTintColor: BRAND_COLOR,
      inactiveTintColor: 'gray',
      labelStyle: {
        fontSize: 14,
        margin: 0,
        padding: 10,
      },
      indicatorStyle: {
        backgroundColor: BRAND_COLOR,
      },
      tabStyle: {
        flex: 1,
      },
      style: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        elevation: 0,
      },
    },
  },
);

class SharingScreen extends PureComponent<Props> {
  static router = SharingTopTabNavigator.router;

  render() {
    const { navigation, auth, dispatch } = this.props;

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
