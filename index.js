/* @flow strict-local */
import { AppRegistry } from 'react-native';
import ZulipMobile from './src/ZulipMobile';
import replyTaskProvider from './src/headless/reply';

AppRegistry.registerComponent('ZulipMobile', () => ZulipMobile);
AppRegistry.registerHeadlessTask('reply', replyTaskProvider);
