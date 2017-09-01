/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getActiveNarrow } from '../selectors';

import UnreadCardsList from './UnreadCardsList';

export default connect(
  state => ({
    narrow: getActiveNarrow(state),
  }),
  boundActions,
)(UnreadCardsList);
