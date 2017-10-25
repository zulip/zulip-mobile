/* @flow */
import connectWithActions from '../connectWithActions';
import ComposeMenu from './ComposeMenu';
import { getActiveNarrow } from '../selectors';

export default connectWithActions(state => ({
  narrow: getActiveNarrow(state),
}))(ComposeMenu);
