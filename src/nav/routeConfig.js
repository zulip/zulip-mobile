/* @flow strict */

import AccountPickScreen from '../account/AccountPickScreen';
import RealmScreen from '../start/RealmScreen';
import AuthScreen from '../start/AuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';
import MainScreenWithTabs from '../main/MainScreenWithTabs';
import AccountDetailsScreen from '../account-info/AccountDetailsScreen';
import GroupDetailsScreen from '../chat/GroupDetailsScreen';
import SearchMessagesScreen from '../search/SearchMessagesScreen';
import UsersScreen from '../users/UsersScreen';
import SubscriptionsScreen from '../subscriptions/SubscriptionsScreen';
import ChatScreen from '../chat/ChatScreen';
import LoadingScreen from '../start/LoadingScreen';
import SettingsScreen from '../settings/SettingsScreen';
import LanguageScreen from '../settings/LanguageScreen';
import PasswordAuthScreen from '../start/PasswordAuthScreen';
import DebugScreen from '../settings/DebugScreen';
import DiagnosticsScreen from '../diagnostics/DiagnosticsScreen';
import VariablesScreen from '../diagnostics/VariablesScreen';
import TimingScreen from '../diagnostics/TimingScreen';
import NotificationDiagScreen from '../diagnostics/NotificationDiagScreen';
import StorageScreen from '../diagnostics/StorageScreen';
import LightboxScreen from '../lightbox/LightboxScreen';
import CreateGroupScreen from '../user-groups/CreateGroupScreen';
import InviteUsersScreen from '../streams/InviteUsersScreen';
import StreamScreen from '../streams/StreamScreen';
import CreateStreamScreen from '../streams/CreateStreamScreen';
import EditStreamScreen from '../streams/EditStreamScreen';
import NotificationsScreen from '../settings/NotificationsScreen';
import TopicListScreen from '../topics/TopicListScreen';
import WelcomeHelpScreen from '../start/WelcomeHelpScreen';
import WelcomeScreen from '../start/WelcomeScreen';
import EmojiPickerScreen from '../emoji/EmojiPickerScreen';
import LegalScreen from '../settings/LegalScreen';
import * as routes from './routeConstants';

export default {
  [routes.AccountPick]: { screen: AccountPickScreen },
  [routes.AccountDetails]: { screen: AccountDetailsScreen },
  [routes.GroupDetails]: { screen: GroupDetailsScreen },
  [routes.Auth]: { screen: AuthScreen },
  [routes.Chat]: { screen: ChatScreen },
  [routes.DevAuth]: { screen: DevAuthScreen },
  [routes.EmojiPicker]: { screen: EmojiPickerScreen },
  [routes.Loading]: { screen: LoadingScreen },
  [routes.Main]: { screen: MainScreenWithTabs },
  [routes.PasswordAuth]: { screen: PasswordAuthScreen },
  [routes.Realm]: { screen: RealmScreen },
  [routes.SearchMessages]: { screen: SearchMessagesScreen },
  [routes.Subscriptions]: { screen: SubscriptionsScreen },
  [routes.Users]: { screen: UsersScreen },
  [routes.Settings]: { screen: SettingsScreen },
  [routes.Language]: { screen: LanguageScreen },
  [routes.Lightbox]: { screen: LightboxScreen },
  [routes.CreateGroup]: { screen: CreateGroupScreen },
  [routes.InviteUsers]: { screen: InviteUsersScreen },
  [routes.Diagnostics]: { screen: DiagnosticsScreen },
  [routes.Variables]: { screen: VariablesScreen },
  [routes.Timing]: { screen: TimingScreen },
  [routes.Storage]: { screen: StorageScreen },
  [routes.Debug]: { screen: DebugScreen },
  [routes.Stream]: { screen: StreamScreen },
  [routes.EditStream]: { screen: EditStreamScreen },
  [routes.CreateStream]: { screen: CreateStreamScreen },
  [routes.TopicList]: { screen: TopicListScreen },
  [routes.NotificationDiag]: { screen: NotificationDiagScreen },
  [routes.Notifications]: { screen: NotificationsScreen },
  [routes.WelcomeHelp]: { screen: WelcomeHelpScreen },
  [routes.Welcome]: { screen: WelcomeScreen },
  [routes.Legal]: { screen: LegalScreen },
};
