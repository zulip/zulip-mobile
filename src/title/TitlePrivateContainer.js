/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getUserInPmNarrow } from '../selectors';
import TitlePrivate from './TitlePrivate';

export default connect(
  state => ({
    user: getUserInPmNarrow(state),
  }),
  boundActions,
)(TitlePrivate);
