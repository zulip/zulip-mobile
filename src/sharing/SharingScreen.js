/* @flow strict-local */
import React, { useEffect } from 'react';
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
import ZulipTextIntl from '../common/ZulipTextIntl';
import Screen from '../common/Screen';
import { getHasAuth } from '../selectors';
import { resetToAccountPicker } from '../nav/navActions';
import ShareToStream from './ShareToStream';
import ShareToPm from './ShareToPm';
import { useHaveServerDataGate } from '../withHaveServerDataGate';

export type SharingNavigatorParamList = {|
  +'share-to-stream': RouteParamsOf<typeof ShareToStream>,
  +'share-to-pm': RouteParamsOf<typeof ShareToPm>,
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

  useEffect(() => {
    if (!hasAuth) {
      // If there is no active logged-in account, abandon the sharing attempt,
      // and present the account picker screen to the user.
      // TODO(?): Offer to come back and finish the share after auth
      NavigationService.dispatch(resetToAccountPicker());
    }
  }, [hasAuth]);

  return (
    <Screen canGoBack={false} title="Share on Zulip" shouldShowLoadingBanner={false}>
      <Tab.Navigator {...materialTopTabNavigatorConfig()} swipeEnabled>
        <Tab.Screen
          name="share-to-stream"
          component={useHaveServerDataGate(ShareToStream)}
          initialParams={params}
          options={{
            tabBarLabel: ({ color }) => (
              <ZulipTextIntl style={[styles.tab, { color }]} text="Stream" />
            ),
          }}
        />
        <Tab.Screen
          name="share-to-pm"
          component={useHaveServerDataGate(ShareToPm)}
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
