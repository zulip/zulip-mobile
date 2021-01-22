/* @flow strict-local */
import React from 'react';
import { Platform } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import {
  createStackNavigator,
  type StackNavigationProp,
  TransitionPresets,
} from '@react-navigation/stack';

import { useSelector } from '../react-redux';
import { hasAuth as getHasAuth, getAccounts, getHaveServerData } from '../selectors';
import getInitialRouteInfo from './getInitialRouteInfo';
import type { GlobalParamList } from './globalTypes';
import type { Narrow, Message, SharedData, UserId } from '../types';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import AccountPickScreen from '../account/AccountPickScreen';
import RealmScreen from '../start/RealmScreen';
import AuthScreen from '../start/AuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';
import MainTabsScreen from '../main/MainTabsScreen';
import MessageReactionsScreen from '../reactions/MessageReactionsScreen';
import AccountDetailsScreen from '../account-info/AccountDetailsScreen';
import GroupDetailsScreen from '../chat/GroupDetailsScreen';
import SearchMessagesScreen from '../search/SearchMessagesScreen';
import UsersScreen from '../users/UsersScreen';
import ChatScreen from '../chat/ChatScreen';
import LoadingScreen from '../start/LoadingScreen';
import LanguageScreen from '../settings/LanguageScreen';
import PasswordAuthScreen from '../start/PasswordAuthScreen';
import DebugScreen from '../settings/DebugScreen';
import DiagnosticsScreen from '../diagnostics/DiagnosticsScreen';
import VariablesScreen from '../diagnostics/VariablesScreen';
import TimingScreen from '../diagnostics/TimingScreen';
import StorageScreen from '../diagnostics/StorageScreen';
import LightboxScreen from '../lightbox/LightboxScreen';
import CreateGroupScreen from '../user-groups/CreateGroupScreen';
import InviteUsersScreen from '../streams/InviteUsersScreen';
import StreamSettingsScreen from '../streams/StreamSettingsScreen';
import CreateStreamScreen from '../streams/CreateStreamScreen';
import EditStreamScreen from '../streams/EditStreamScreen';
import NotificationsScreen from '../settings/NotificationsScreen';
import TopicListScreen from '../topics/TopicListScreen';
import EmojiPickerScreen from '../emoji/EmojiPickerScreen';
import LegalScreen from '../settings/LegalScreen';
import UserStatusScreen from '../user-status/UserStatusScreen';
import SharingScreen from '../sharing/SharingScreen';

export type AppNavigatorParamList = {|
  'account-pick': void,
  'account-details': {| userId: UserId |},
  'group-details': {| recipients: $ReadOnlyArray<UserId> |},
  auth: {| serverSettings: ApiResponseServerSettings |},
  chat: {| narrow: Narrow |},
  'dev-auth': void,
  'emoji-picker': {| messageId: number |},
  loading: void,
  'main-tabs': void,
  'message-reactions': {| reactionName?: string, messageId: number |},
  password: {| requireEmailFormat: boolean |},
  realm: {| realm: URL | void, initial: boolean | void |},
  search: void,
  users: void,
  language: void,
  lightbox: {| src: string, message: Message |},
  group: void,
  'invite-users': {| streamId: number |},
  diagnostics: void,
  variables: void,
  timing: void,
  storage: void,
  debug: void,
  'stream-settings': {| streamId: number |},
  'stream-edit': {| streamId: number |},
  'stream-create': void,
  topics: {| streamId: number |},
  notifications: void,
  legal: void,
  'user-status': void,
  sharing: {| sharedData: SharedData |},
|};

export type AppNavigationProp<
  +RouteName: $Keys<AppNavigatorParamList> = $Keys<AppNavigatorParamList>,
> = StackNavigationProp<GlobalParamList, RouteName>;

export type AppNavigationRouteProp<
  RouteName: $Keys<AppNavigatorParamList> = $Keys<AppNavigatorParamList>,
> = RouteProp<GlobalParamList, RouteName>;

const Stack = createStackNavigator<GlobalParamList, AppNavigatorParamList, AppNavigationProp<>>();

type Props = $ReadOnly<{||}>;

export default function AppNavigator(props: Props) {
  const hasAuth = useSelector(getHasAuth);
  const accounts = useSelector(getAccounts);
  const haveServerData = useSelector(getHaveServerData);

  const { initialRouteName, initialRouteParams } = getInitialRouteInfo({
    hasAuth,
    accounts,
    haveServerData,
  });

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      headerMode="none"
      screenOptions={{
        ...Platform.select({
          android: TransitionPresets.FadeFromBottomAndroid,
          ios: TransitionPresets.DefaultTransition,
        }),
      }}
    >
      <Stack.Screen name="account-pick" component={AccountPickScreen} />
      <Stack.Screen name="account-details" component={AccountDetailsScreen} />
      <Stack.Screen name="group-details" component={GroupDetailsScreen} />
      <Stack.Screen name="auth" component={AuthScreen} />
      <Stack.Screen name="chat" component={ChatScreen} />
      <Stack.Screen name="dev-auth" component={DevAuthScreen} />
      <Stack.Screen name="emoji-picker" component={EmojiPickerScreen} />
      <Stack.Screen name="loading" component={LoadingScreen} />
      <Stack.Screen
        name="main-tabs"
        component={MainTabsScreen}
        options={{
          // So we don't show a transition animation between 'loading'
          // and 'main'.
          animationEnabled: false,
        }}
      />
      <Stack.Screen name="message-reactions" component={MessageReactionsScreen} />
      <Stack.Screen name="password" component={PasswordAuthScreen} />
      <Stack.Screen
        name="realm"
        component={RealmScreen}
        initialParams={initialRouteName === 'realm' ? initialRouteParams : undefined}
      />
      <Stack.Screen name="search" component={SearchMessagesScreen} />
      <Stack.Screen name="users" component={UsersScreen} />
      <Stack.Screen name="language" component={LanguageScreen} />
      <Stack.Screen name="lightbox" component={LightboxScreen} />
      <Stack.Screen name="group" component={CreateGroupScreen} />
      <Stack.Screen name="invite-users" component={InviteUsersScreen} />
      <Stack.Screen name="diagnostics" component={DiagnosticsScreen} />
      <Stack.Screen name="variables" component={VariablesScreen} />
      <Stack.Screen name="timing" component={TimingScreen} />
      <Stack.Screen name="storage" component={StorageScreen} />
      <Stack.Screen name="debug" component={DebugScreen} />
      <Stack.Screen name="stream-settings" component={StreamSettingsScreen} />
      <Stack.Screen name="stream-edit" component={EditStreamScreen} />
      <Stack.Screen name="stream-create" component={CreateStreamScreen} />
      <Stack.Screen name="topics" component={TopicListScreen} />
      <Stack.Screen name="notifications" component={NotificationsScreen} />
      <Stack.Screen name="legal" component={LegalScreen} />
      <Stack.Screen name="user-status" component={UserStatusScreen} />
      <Stack.Screen name="sharing" component={SharingScreen} />
    </Stack.Navigator>
  );
}
