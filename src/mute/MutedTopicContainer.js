/* @flow */
import connectWithActions from '../connectWithActions';
import { getAuth, getMute } from '../selectors';

import MutedTopicScreen from './MutedTopicScreen';

export default connectWithActions(state => ({
  auth: getAuth(state),
  mute: getMute(state),
}))(MutedTopicScreen);
