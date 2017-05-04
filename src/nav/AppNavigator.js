import { StackNavigator } from 'react-navigation';

import AccountPickScreen from '../account/AccountPickScreen';
import RealmScreen from '../start/RealmScreen';
import AuthScreen from '../start/AuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';
import MainScreenContainer from '../main/MainScreenContainer';
import AccountDetailsScreen from '../account-info/AccountDetailsScreen';
import SearchMessagesScreen from '../search/SearchMessagesScreen';
import UsersScreen from '../users/UsersScreen';
import SubscriptionsScreen from '../subscriptions/SubscriptionsScreen';
import ChatScreen from '../chat/ChatScreen';
import LoadingScreen from '../start/LoadingScreen';
import SettingsScreen from '../settings/SettingsScreen';

export default StackNavigator({
  account: { screen: AccountPickScreen, title: 'Account', },
  accountDetails: { screen: AccountDetailsScreen, title: 'Account Details', },
  auth: { screen: AuthScreen },
  chat: { screen: ChatScreen },
  dev: { screen: DevAuthScreen },
  loading: { screen: LoadingScreen },
  main: { screen: MainScreenContainer },
  realm: { screen: RealmScreen }, // TODO: {...props.scene.route.data} />
  search: { screen: SearchMessagesScreen },
  subscriptions: { screen: SubscriptionsScreen },
  users: { screen: UsersScreen },
  settings: { screen: SettingsScreen },
}, {
  initialRouteName: 'main',
  headerMode: 'none',
  cardStyle: {
    backgroundColor: 'white',
  },
});
