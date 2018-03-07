/* @flow */
import connectWithActions from '../connectWithActions';
import ComposeMenu from './ComposeMenu';
import { getNarrowToSendTo } from '../selectors';

export default connectWithActions((state, props) => ({
  narrow: getNarrowToSendTo(props.narrow)(state),
}))(ComposeMenu);
