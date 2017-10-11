/* @flow */
import connectWithActions from '../connectWithActions';
import { getActiveNarrow } from '../selectors';
import TitleSpecial from './TitleSpecial';

export default connectWithActions(state => ({
  narrow: getActiveNarrow(state),
}))(TitleSpecial);
