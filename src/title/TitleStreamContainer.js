/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getActiveNarrow, getStreamInNarrow } from '../selectors';
import TitleStream from './TitleStream';

export default connect(
  state => ({
    narrow: getActiveNarrow(state),
    stream: getStreamInNarrow(state),
  }),
  boundActions,
)(TitleStream);
