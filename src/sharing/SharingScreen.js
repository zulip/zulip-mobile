/* @flow strict-local */
import React, { PureComponent } from 'react';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabNavigationProp,
} from '@react-navigation/material-top-tabs';

import type { GlobalParamList } from '../nav/globalTypes';
import type { RouteParamsOf, RouteProp } from '../react-navigation';

import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, Auth, SharedData } from '../types';
import { createStyleSheet } from '../styles';
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import { connect } from '../react-redux';
import { Label, Screen } from '../common';
import { tryGetAuth } from '../selectors';
import { navigateToAccountPicker } from '../nav/navActions';
import ShareToStream from './ShareToStream';
import ShareToPm from './ShareToPm';

export type SharingNavigatorParamList = {|
  'share-to-stream': RouteParamsOf<typeof ShareToStream>,
  'share-to-pm': RouteParamsOf<typeof ShareToPm>,
|};

export type SharingNavigationProp<
  +RouteName: $Keys<SharingNavigatorParamList> = $Keys<SharingNavigatorParamList>,
> = MaterialTopTabNavigationProp<GlobalParamList, RouteName>;

const Tab = createMaterialTopTabNavigator<
  GlobalParamList,
  SharingNavigatorParamList,
  SharingNavigationProp<>,
>();

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'sharing'>,
  route: RouteProp<'sharing', {| sharedData: SharedData |}>,

  auth: Auth | void,
  dispatch: Dispatch,
|}>;

const styles = createStyleSheet({
  tab: {
    padding: 8,
    fontSize: 16,
  },
});

class SharingScreen extends PureComponent<Props> {
  render() {
    const { auth } = this.props;
    const { params } = this.props.route;

    // If there is no active logged-in account, abandon the sharing attempt,
    // and present the account picker screen to the user.
    if (auth === undefined) {
      NavigationService.dispatch(navigateToAccountPicker());
      return null;
    }

    return (
      <Screen canGoBack={false} title="Share on Zulip" shouldShowLoadingBanner={false}>
        <Tab.Navigator
          {...materialTopTabNavigatorConfig({
            showLabel: true,
            showIcon: false,
          })}
          swipeEnabled
        >
          <Tab.Screen
            name="share-to-stream"
            component={ShareToStream}
            initialParams={params}
            options={{
              tabBarLabel: ({ color }) => <Label style={[styles.tab, { color }]} text="Stream" />,
            }}
          />
          <Tab.Screen
            name="share-to-pm"
            component={ShareToPm}
            initialParams={params}
            options={{
              tabBarLabel: ({ color }) => (
                <Label style={[styles.tab, { color }]} text="Private Message" />
              ),
            }}
          />
        </Tab.Navigator>
      </Screen>
    );
  }
}

export default connect(state => ({
  auth: tryGetAuth(state),
}))(SharingScreen);
