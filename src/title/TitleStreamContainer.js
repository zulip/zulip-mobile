/* @flow */
import connectWithActions from '../connectWithActions';
import { getActiveNarrow, getStreamInNarrow } from '../selectors';
import TitleStream from './TitleStream';

export default connectWithActions(state => ({
  narrow: getActiveNarrow(state),
  stream: getStreamInNarrow(state),
}))(TitleStream);
