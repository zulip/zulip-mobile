/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabNavigationProp,
} from '@react-navigation/material-top-tabs';

import type { GlobalParamList } from '../nav/globalTypes';
import type { RouteParamsOf, RouteProp } from '../react-navigation';

import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { SharedData } from './types';
import { createStyleSheet } from '../styles';
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import { useGlobalSelector } from '../react-redux';
import { ZulipTextIntl, Screen } from '../common';
import { getHasAuth } from '../selectors';
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
|}>;

const styles = createStyleSheet({
  tab: {
    padding: 8,
    fontSize: 16,
  },
});

export default function SharingScreen(props: Props): Node {
  const { params } = props.route;
  const hasAuth = useGlobalSelector(getHasAuth);

  // If there is no active logged-in account, abandon the sharing attempt,
  // and present the account picker screen to the user.
  if (!hasAuth) {
    NavigationService.dispatch(navigateToAccountPicker());
    return null;
  }

  return (
    <Screen canGoBack={false} title="Share on Zulip" shouldShowLoadingBanner={false}>
      <Tab.Navigator {...materialTopTabNavigatorConfig()} swipeEnabled>
        <Tab.Screen
          name="share-to-stream"
          component={ShareToStream}
          initialParams={params}
          options={{
            tabBarLabel: ({ color }) => (
              <ZulipTextIntl style={[styles.tab, { color }]} text="Stream" />
            ),
          }}
        />
        <Tab.Screen
          name="share-to-pm"
          component={ShareToPm}
          initialParams={params}
          options={{
            tabBarLabel: ({ color }) => (
              <ZulipTextIntl style={[styles.tab, { color }]} text="Private Message" />
            ),
          }}
        />
      </Tab.Navigator>
    </Screen>
  );
}
