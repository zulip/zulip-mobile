/* @flow strict-local */
import React from 'react';
import { Platform } from 'react-native';
import {
  createStackNavigator,
  type StackNavigationProp,
  TransitionPresets,
} from '@react-navigation/stack';

import type { RouteParamsOf } from '../react-navigation';
import { useSelector } from '../react-redux';
import { hasAuth as getHasAuth, getAccounts, getHaveServerData } from '../selectors';
import getInitialRouteInfo from './getInitialRouteInfo';
import type { GlobalParamList } from './globalTypes';
import AccountPickScreen from '../account/AccountPickScreen';
import RealmInputScreen from '../start/RealmInputScreen';
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
  'account-pick': RouteParamsOf<typeof AccountPickScreen>,
  'account-details': RouteParamsOf<typeof AccountDetailsScreen>,
  'group-details': RouteParamsOf<typeof GroupDetailsScreen>,
  auth: RouteParamsOf<typeof AuthScreen>,
  chat: RouteParamsOf<typeof ChatScreen>,
  'dev-auth': RouteParamsOf<typeof DevAuthScreen>,
  'emoji-picker': RouteParamsOf<typeof EmojiPickerScreen>,
  loading: RouteParamsOf<typeof LoadingScreen>,
  'main-tabs': RouteParamsOf<typeof MainTabsScreen>,
  'message-reactions': RouteParamsOf<typeof MessageReactionsScreen>,
  'password-auth': RouteParamsOf<typeof PasswordAuthScreen>,
  'realm-input': RouteParamsOf<typeof RealmInputScreen>,
  'search-messages': RouteParamsOf<typeof SearchMessagesScreen>,
  users: RouteParamsOf<typeof UsersScreen>,
  language: RouteParamsOf<typeof LanguageScreen>,
  lightbox: RouteParamsOf<typeof LightboxScreen>,
  'create-group': RouteParamsOf<typeof CreateGroupScreen>,
  'invite-users': RouteParamsOf<typeof InviteUsersScreen>,
  diagnostics: RouteParamsOf<typeof DiagnosticsScreen>,
  variables: RouteParamsOf<typeof VariablesScreen>,
  timing: RouteParamsOf<typeof TimingScreen>,
  storage: RouteParamsOf<typeof StorageScreen>,
  debug: RouteParamsOf<typeof DebugScreen>,
  'stream-settings': RouteParamsOf<typeof StreamSettingsScreen>,
  'edit-stream': RouteParamsOf<typeof EditStreamScreen>,
  'create-stream': RouteParamsOf<typeof CreateStreamScreen>,
  'topic-list': RouteParamsOf<typeof TopicListScreen>,
  notifications: RouteParamsOf<typeof NotificationsScreen>,
  legal: RouteParamsOf<typeof LegalScreen>,
  'user-status': RouteParamsOf<typeof UserStatusScreen>,
  sharing: RouteParamsOf<typeof SharingScreen>,
|};

export type AppNavigationProp<
  +RouteName: $Keys<AppNavigatorParamList> = $Keys<AppNavigatorParamList>,
> = StackNavigationProp<GlobalParamList, RouteName>;

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
      <Stack.Screen name="main-tabs" component={MainTabsScreen} />
      <Stack.Screen name="message-reactions" component={MessageReactionsScreen} />
      <Stack.Screen name="password-auth" component={PasswordAuthScreen} />
      <Stack.Screen
        name="realm-input"
        component={RealmInputScreen}
        initialParams={initialRouteName === 'realm-input' ? initialRouteParams : undefined}
      />
      <Stack.Screen name="search-messages" component={SearchMessagesScreen} />
      <Stack.Screen name="users" component={UsersScreen} />
      <Stack.Screen name="language" component={LanguageScreen} />
      <Stack.Screen name="lightbox" component={LightboxScreen} />
      <Stack.Screen name="create-group" component={CreateGroupScreen} />
      <Stack.Screen name="invite-users" component={InviteUsersScreen} />
      <Stack.Screen name="diagnostics" component={DiagnosticsScreen} />
      <Stack.Screen name="variables" component={VariablesScreen} />
      <Stack.Screen name="timing" component={TimingScreen} />
      <Stack.Screen name="storage" component={StorageScreen} />
      <Stack.Screen name="debug" component={DebugScreen} />
      <Stack.Screen name="stream-settings" component={StreamSettingsScreen} />
      <Stack.Screen name="edit-stream" component={EditStreamScreen} />
      <Stack.Screen name="create-stream" component={CreateStreamScreen} />
      <Stack.Screen name="topic-list" component={TopicListScreen} />
      <Stack.Screen name="notifications" component={NotificationsScreen} />
      <Stack.Screen name="legal" component={LegalScreen} />
      <Stack.Screen name="user-status" component={UserStatusScreen} />
      <Stack.Screen name="sharing" component={SharingScreen} />
    </Stack.Navigator>
  );
}
