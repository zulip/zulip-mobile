/* @flow */
import { createStackNavigator } from 'react-navigation';
import routeConfig from './routeConfig';

export default createStackNavigator(routeConfig, {
  initialRouteName: 'main',
  headerMode: 'none',
  cardStyle: {
    backgroundColor: 'white',
  },
});
