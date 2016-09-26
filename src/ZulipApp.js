import React from 'react';
import { connect } from 'react-redux';

import ZulipAccountsView from './user/ZulipAccountsView';
import ZulipMainView from './nav/ZulipMainView';

const ZulipApp = (props) =>
  (props.loggedIn ? <ZulipMainView /> : <ZulipAccountsView />);

const mapStateToProps = (state) => ({
  loggedIn: state.user.accounts.some((account) => account.loggedIn) &&
            state.user.activeAccountId !== null,
});

export default connect(mapStateToProps)(ZulipApp);
