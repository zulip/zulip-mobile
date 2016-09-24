import React from 'react';
import { connect } from 'react-redux';

import MainView from './main/MainView';
import ZulipAccountsView from './user/ZulipAccountsView';

const ZulipApp = (props) => {
  return props.loggedIn ? <MainView /> : <ZulipAccountsView />;
};

const mapStateToProps = (state) => ({
  // The user is logged in if any of the user's accounts is logged in
  // and one of them is selected as the active account
  loggedIn: state.user.accounts.some((account) => account.loggedIn) &&
            state.user.activeAccountId !== null,
});

export default connect(mapStateToProps)(ZulipApp);
