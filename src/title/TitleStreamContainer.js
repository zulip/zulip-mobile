/* @flow */
import connectWithActions from '../connectWithActions';
import { getStreamInNarrow } from '../selectors';
import TitleStream from './TitleStream';

export default connectWithActions((state, props) => ({
  stream: getStreamInNarrow(props.narrow)(state),
}))(TitleStream);
