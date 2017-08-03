/* TODO flow */
import { StackNavigator } from 'react-navigation';

import AccountPickScreen from '../account/AccountPickScreen';
import RealmScreen from '../start/RealmScreen';
import AuthScreen from '../start/AuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';
import MainScreenContainer from '../main/MainScreenContainer';
import AccountDetailsScreen from '../account-info/AccountDetailsScreen';
import GroupDetailsScreen from '../chat/GroupDetailsScreen';
import SearchMessagesScreen from '../search/SearchMessagesScreen';
import UsersScreen from '../users/UsersScreen';
import SubscriptionsScreen from '../subscriptions/SubscriptionsScreen';
import ChatScreen from '../chat/ChatScreen';
import LoadingScreen from '../start/LoadingScreen';
import SettingsScreen from '../settings/SettingsScreen';
import SettingsDetailScreen from '../settings/SettingsDetailScreen';
import StreamSettings from '../streams/StreamSettings';
import LightboxScreen from '../lightbox/LightboxScreen';

export default StackNavigator(
  {
    account: { screen: AccountPickScreen },
    'account-details': { screen: AccountDetailsScreen },
    'group-details': { screen: GroupDetailsScreen },
    auth: { screen: AuthScreen },
    chat: { screen: ChatScreen },
    dev: { screen: DevAuthScreen },
    loading: { screen: LoadingScreen },
    main: { screen: MainScreenContainer },
    realm: { screen: RealmScreen },
    search: { screen: SearchMessagesScreen },
    subscriptions: { screen: SubscriptionsScreen },
    users: { screen: UsersScreen },
    settings: { screen: SettingsScreen },
    'settings-detail': { screen: SettingsDetailScreen },
    'stream-settings': { screen: StreamSettings },
    lightbox: { screen: LightboxScreen },
  },
  {
    initialRouteName: 'main',
    headerMode: 'none',
    cardStyle: {
      backgroundColor: 'white',
    },
  },
);
