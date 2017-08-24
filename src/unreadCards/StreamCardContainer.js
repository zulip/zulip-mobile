/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getActiveNarrow } from '../selectors';

import StreamCard from './StreamCard';

export default connect(
  state => ({
    narrow: getActiveNarrow(state),
  }),
  boundActions,
)(StreamCard);
