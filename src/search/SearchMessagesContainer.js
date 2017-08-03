/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../selectors';
import SearchMessagesCard from './SearchMessagesCard';

export default connect(
  state => ({
    auth: getAuth(state),
    isOnline: state.app.isOnline,
    subscriptions: state.subscriptions,
    narrow: state.chat.narrow,
    startReached: state.chat.startReached,
    streamlistOpened: state.nav.opened,
    flags: state.flags,
  }),
  boundActions,
)(SearchMessagesCard);
