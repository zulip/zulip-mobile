/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getActiveNarrow } from '../selectors';
import TitleSpecial from './TitleSpecial';

export default connect(
  state => ({
    narrow: getActiveNarrow(state),
  }),
  boundActions,
)(TitleSpecial);
