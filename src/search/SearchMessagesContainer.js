/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../selectors';
import SearchMessagesCard from './SearchMessagesCard';

export default connect(
  state => ({
    auth: getAuth(state),
  }),
  boundActions,
)(SearchMessagesCard);
