import React from 'react';
import { connect } from 'react-redux';

import ZulipAccountsView from './user/ZulipAccountsView';
import ZulipMainView from './nav/ZulipMainView';

const ZulipApp = (props) =>
  (props.loggedIn ? <ZulipMainView /> : <ZulipAccountsView />);

const mapStateToProps = (state) => ({
  isLoggedIn: state.auth.isLoggedIn,
});

export default connect(mapStateToProps)(ZulipApp);
