/* @flow */
import { connect } from 'react-redux';

import ComposeMenu from './ComposeMenu';
import { getNarrowToSendTo } from '../selectors';

export default connect((state, props) => ({
  narrow: getNarrowToSendTo(props.narrow)(state),
}))(ComposeMenu);
