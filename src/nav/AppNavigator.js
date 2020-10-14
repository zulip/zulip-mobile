/* @flow strict-local */
import { Platform } from 'react-native';
import type { ScreenParams } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import {
  createCompatNavigatorFactory,
  type NavigationNavigator,
  type NavigationStackProp,
  NavigationStateRoute,
} from '@react-navigation/compat';

import type { Narrow, Message, SharedData } from '../types';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import type { GlobalParamList } from './globalTypes';
import AccountPickScreen from '../account/AccountPickScreen';
import RealmScreen from '../start/RealmScreen';
import AuthScreen from '../start/AuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';
import MainScreenWithTabs from '../main/MainScreenWithTabs';
import MessageReactionList from '../reactions/MessageReactionList';
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
import StreamScreen from '../streams/StreamScreen';
import CreateStreamScreen from '../streams/CreateStreamScreen';
import EditStreamScreen from '../streams/EditStreamScreen';
import NotificationsScreen from '../settings/NotificationsScreen';
import TopicListScreen from '../topics/TopicListScreen';
import EmojiPickerScreen from '../emoji/EmojiPickerScreen';
import LegalScreen from '../settings/LegalScreen';
import UserStatusScreen from '../user-status/UserStatusScreen';
import SharingScreen from '../sharing/SharingScreen';

export type AppNavigatorParamList = {|
  account: void,
  'account-details': {| userId: number |},
  'group-details': {| recipients: $ReadOnlyArray<number> |},
  auth: {| serverSettings: ApiResponseServerSettings |},
  chat: {| narrow: Narrow |},
  dev: void,
  'emoji-picker': {| messageId: number |},
  loading: void,
  main: void,
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
  stream: {| streamId: number |},
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
> = NavigationStackProp<{|
  ...NavigationStateRoute,
  params: $ElementType<GlobalParamList, RouteName>,
|}>;

export const createAppNavigator = (args: {|
  initialRouteName: string,
  initialRouteParams?: ScreenParams,
  // flowlint-next-line deprecated-type:off
|}): NavigationNavigator<*, *, *> =>
  createCompatNavigatorFactory(createStackNavigator)(
    {
      account: { screen: AccountPickScreen },
      'account-details': { screen: AccountDetailsScreen },
      'group-details': { screen: GroupDetailsScreen },
      auth: { screen: AuthScreen },
      chat: { screen: ChatScreen },
      dev: { screen: DevAuthScreen },
      'emoji-picker': { screen: EmojiPickerScreen },
      loading: { screen: LoadingScreen },
      main: {
        screen: MainScreenWithTabs,
        navigationOptions: {
          // So we don't show a transition animation between 'loading'
          // and 'main'.
          animationEnabled: false,
        },
      },
      'message-reactions': { screen: MessageReactionList },
      password: { screen: PasswordAuthScreen },
      realm: { screen: RealmScreen },
      search: { screen: SearchMessagesScreen },
      users: { screen: UsersScreen },
      language: { screen: LanguageScreen },
      lightbox: { screen: LightboxScreen },
      group: { screen: CreateGroupScreen },
      'invite-users': { screen: InviteUsersScreen },
      diagnostics: { screen: DiagnosticsScreen },
      variables: { screen: VariablesScreen },
      timing: { screen: TimingScreen },
      storage: { screen: StorageScreen },
      debug: { screen: DebugScreen },
      stream: { screen: StreamScreen },
      'stream-edit': { screen: EditStreamScreen },
      'stream-create': { screen: CreateStreamScreen },
      topics: { screen: TopicListScreen },
      notifications: { screen: NotificationsScreen },
      legal: { screen: LegalScreen },
      'user-status': { screen: UserStatusScreen },
      sharing: { screen: SharingScreen },
    },
    {
      defaultNavigationOptions: {
        ...Platform.select({
          android: TransitionPresets.FadeFromBottomAndroid,
          ios: TransitionPresets.DefaultTransition,
        }),
      },
      initialRouteName: args.initialRouteName,
      initialRouteParams: args.initialRouteParams,
      headerMode: 'none',
    },
  );
