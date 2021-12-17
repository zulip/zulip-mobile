/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Platform } from 'react-native';
import {
  createStackNavigator,
  type StackNavigationProp,
  TransitionPresets,
} from '@react-navigation/stack';

import type { RouteParamsOf } from '../react-navigation';
import { useGlobalSelector } from '../react-redux';
import { getHasAuth, getAccounts } from '../selectors';
import getInitialRouteInfo from './getInitialRouteInfo';
import type { GlobalParamList } from './globalTypes';
import AccountPickScreen from '../account/AccountPickScreen';
import RealmInputScreen from '../start/RealmInputScreen';
import AuthScreen from '../start/AuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';
import MainTabsScreen from '../main/MainTabsScreen';
import MessageReactionsScreen from '../reactions/MessageReactionsScreen';
import AccountDetailsScreen from '../account-info/AccountDetailsScreen';
import PmConversationDetailsScreen from '../chat/PmConversationDetailsScreen';
import SearchMessagesScreen from '../search/SearchMessagesScreen';
import UsersScreen from '../users/UsersScreen';
import ChatScreen from '../chat/ChatScreen';
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
import SettingsScreen from '../settings/SettingsScreen';
import UserStatusScreen from '../user-status/UserStatusScreen';
import SharingScreen from '../sharing/SharingScreen';
import { useHaveServerDataGate } from '../withHaveServerDataGate';

export type AppNavigatorParamList = {|
  'account-pick': RouteParamsOf<typeof AccountPickScreen>,
  'account-details': RouteParamsOf<typeof AccountDetailsScreen>,
  'pm-conversation-details': RouteParamsOf<typeof PmConversationDetailsScreen>,
  auth: RouteParamsOf<typeof AuthScreen>,
  chat: RouteParamsOf<typeof ChatScreen>,
  'dev-auth': RouteParamsOf<typeof DevAuthScreen>,
  'emoji-picker': RouteParamsOf<typeof EmojiPickerScreen>,
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
  settings: RouteParamsOf<typeof SettingsScreen>,
|};

export type AppNavigationProp<
  +RouteName: $Keys<AppNavigatorParamList> = $Keys<AppNavigatorParamList>,
> = StackNavigationProp<GlobalParamList, RouteName>;

const Stack = createStackNavigator<GlobalParamList, AppNavigatorParamList, AppNavigationProp<>>();

type Props = $ReadOnly<{||}>;

export default function AppNavigator(props: Props): Node {
  const hasAuth = useGlobalSelector(getHasAuth);
  const accounts = useGlobalSelector(getAccounts);

  const { initialRouteName, initialRouteParams } = getInitialRouteInfo({
    hasAuth,
    accounts,
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
      {/* These screens expect server data in order to function normally. */}
      <Stack.Screen
        name="account-details"
        component={useHaveServerDataGate(AccountDetailsScreen)}
      />
      <Stack.Screen
        name="pm-conversation-details"
        component={useHaveServerDataGate(PmConversationDetailsScreen)}
      />
      <Stack.Screen name="chat" component={useHaveServerDataGate(ChatScreen)} />
      <Stack.Screen name="emoji-picker" component={useHaveServerDataGate(EmojiPickerScreen)} />
      <Stack.Screen name="main-tabs" component={useHaveServerDataGate(MainTabsScreen)} />
      <Stack.Screen
        name="message-reactions"
        component={useHaveServerDataGate(MessageReactionsScreen)}
      />
      <Stack.Screen
        name="search-messages"
        component={useHaveServerDataGate(SearchMessagesScreen)}
      />
      <Stack.Screen name="users" component={useHaveServerDataGate(UsersScreen)} />
      <Stack.Screen name="language" component={useHaveServerDataGate(LanguageScreen)} />
      <Stack.Screen name="lightbox" component={useHaveServerDataGate(LightboxScreen)} />
      <Stack.Screen name="create-group" component={useHaveServerDataGate(CreateGroupScreen)} />
      <Stack.Screen name="invite-users" component={useHaveServerDataGate(InviteUsersScreen)} />
      <Stack.Screen name="diagnostics" component={useHaveServerDataGate(DiagnosticsScreen)} />
      <Stack.Screen name="variables" component={useHaveServerDataGate(VariablesScreen)} />
      <Stack.Screen name="timing" component={useHaveServerDataGate(TimingScreen)} />
      <Stack.Screen name="storage" component={useHaveServerDataGate(StorageScreen)} />
      <Stack.Screen name="debug" component={useHaveServerDataGate(DebugScreen)} />
      <Stack.Screen
        name="stream-settings"
        component={useHaveServerDataGate(StreamSettingsScreen)}
      />
      <Stack.Screen name="edit-stream" component={useHaveServerDataGate(EditStreamScreen)} />
      <Stack.Screen name="create-stream" component={useHaveServerDataGate(CreateStreamScreen)} />
      <Stack.Screen name="topic-list" component={useHaveServerDataGate(TopicListScreen)} />
      <Stack.Screen name="notifications" component={useHaveServerDataGate(NotificationsScreen)} />
      <Stack.Screen name="legal" component={useHaveServerDataGate(LegalScreen)} />
      <Stack.Screen name="user-status" component={useHaveServerDataGate(UserStatusScreen)} />
      <Stack.Screen name="settings" component={useHaveServerDataGate(SettingsScreen)} />

      {/* These screens do not expect server data in order to function
          normally. */}
      <Stack.Screen name="account-pick" component={AccountPickScreen} />
      <Stack.Screen name="auth" component={AuthScreen} />
      <Stack.Screen name="dev-auth" component={DevAuthScreen} />
      <Stack.Screen name="password-auth" component={PasswordAuthScreen} />
      <Stack.Screen
        name="realm-input"
        component={RealmInputScreen}
        initialParams={initialRouteName === 'realm-input' ? initialRouteParams : undefined}
      />
      <Stack.Screen name="sharing" component={SharingScreen} />
    </Stack.Navigator>
  );
}
