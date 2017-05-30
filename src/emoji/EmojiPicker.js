/* @flow */
import { TabNavigator } from 'react-navigation';

import {
  Activities,
  Animals,
  Custom,
  Food,
  Objects,
  RecentlyUsed,
  Search,
  Smiles,
  Symbols,
  Travel
} from './tabs';
import { BRAND_COLOR } from '../styles';

const EmojiPicker = TabNavigator({
  RUsed: {
    screen: RecentlyUsed,
  },
  Smiles: {
    screen: Smiles,
  },
  Food: {
    screen: Food,
  },
  Activities: {
    screen: Activities,
  },
  Travel: {
    screen: Travel,
  },
  Objects: {
    screen: Objects,
  },
  Symbols: {
    screen: Symbols,
  },
  Custom: {
    screen: Custom,
  },
  Search: {
    screen: Search,
  },
}, {
  tabBarOptions: {
    activeBackgroundColor: '#eaedf2',
    inactiveBackgroundColor: '#fff',
    labelStyle: {
      fontSize: 18,
      color: '#000',
      margin: 0,
    },
    style: {
      backgroundColor: '#fff'
    },
    indicatorStyle: {
      backgroundColor: BRAND_COLOR,
    }
  },
  swipeEnabled: true,
  tabBarPosition: 'top',
  lazy: true,
  scrollEnabled: true,
  activeTintColor: '#000',

});

export default EmojiPicker;
