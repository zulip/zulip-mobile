/* @flow strict-local */
import { AppRegistry } from 'react-native';
import ZulipMobile from './src/ZulipMobile';
import FetchTask from './src/headless/FetchTask';

AppRegistry.registerComponent('ZulipMobile', () => ZulipMobile);
AppRegistry.registerHeadlessTask('FetchTask', () => FetchTask);
