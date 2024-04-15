/* @flow strict-local */
import React, { useEffect } from 'react';
import type { Node } from 'react';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabNavigationProp,
} from '@react-navigation/material-top-tabs';

import type { RouteParamsOf, RouteProp } from '../react-navigation';
import type { AppNavigationMethods, AppNavigationProp } from '../nav/AppNavigator';
import type { SharedData } from './types';
import { createStyleSheet } from '../styles';
import { materialTopTabNavOptions } from '../styles/tabs';
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
> =
  // Screens on this navigator will get a `navigation` prop that reflects
  // this navigator itself…
  MaterialTopTabNavigationProp<SharingNavigatorParamList, RouteName> &
    // … plus the methods it gets from its parent navigator.
    AppNavigationMethods;

const Tab = createMaterialTopTabNavigator<SharingNavigatorParamList>();

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
  const { navigation } = props;
  const hasAuth = useGlobalSelector(getHasAuth);

  useEffect(() => {
    if (!hasAuth) {
      // If there is no active logged-in account, abandon the sharing attempt,
      // and present the account picker screen to the user.
      // TODO(?): Offer to come back and finish the share after auth
      navigation.dispatch(resetToAccountPicker());
    }
  }, [hasAuth, navigation]);

  return (
    <Screen
      canGoBack={false}
      title="Share on Zulip"
      shouldShowLoadingBanner={false}
      scrollEnabled={false}
    >
      <Tab.Navigator screenOptions={materialTopTabNavOptions()}>
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
              <ZulipTextIntl style={[styles.tab, { color }]} text="Direct message" />
            ),
          }}
        />
      </Tab.Navigator>
    </Screen>
  );
}
