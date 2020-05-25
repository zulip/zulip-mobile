/* @flow strict-local */
import { AppRegistry } from 'react-native';
import ZulipMobile from './src/ZulipMobile';
import SharingRoot from './src/sharing/SharingRoot';

AppRegistry.registerComponent('ZulipMobile', () => ZulipMobile);
AppRegistry.registerComponent('SharingRoot', () => SharingRoot);
