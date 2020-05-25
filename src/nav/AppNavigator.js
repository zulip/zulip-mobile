/* @flow strict-local */
import { createStackNavigator } from 'react-navigation';

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

export default createStackNavigator(
  // $FlowFixMe react-navigation types :-/ -- see a36814e80
  {
    account: { screen: AccountPickScreen },
    'account-details': { screen: AccountDetailsScreen },
    'group-details': { screen: GroupDetailsScreen },
    auth: { screen: AuthScreen },
    chat: { screen: ChatScreen },
    dev: { screen: DevAuthScreen },
    'emoji-picker': { screen: EmojiPickerScreen },
    loading: { screen: LoadingScreen },
    main: { screen: MainScreenWithTabs },
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
    initialRouteName: 'main',
    headerMode: 'none',
    cardStyle: {
      backgroundColor: 'white',
    },
  },
);
