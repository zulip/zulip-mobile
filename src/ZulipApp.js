import React from 'react';
import { connect } from 'react-redux';

// UI elements
import ZulipAccountsView from './user/ZulipAccountsView';

import ZulipNavBar from './nav/ZulipNavBar';
import ZulipStreamView from './stream/ZulipStreamView';
import ZulipComposeBar from './compose/ZulipComposeBar';
import ZulipDrawer from './userlist/ZulipDrawer';

const ZulipApp = (props) => {

  return <ZulipDrawer />;
  if (!props.loggedIn) {
    return (
      <ZulipAccountsView />
    );
  }
  return (
    <ZulipNavBar>
      <ZulipStreamView />
      <ZulipComposeBar />
    </ZulipNavBar>
  );
};

const mapStateToProps = (state) => ({
  // The user is logged in if any of the user's accounts is logged in
  // and one of them is selected as the active account
  loggedIn: state.user.accounts.some((account) => account.loggedIn) &&
            state.user.activeAccountId !== null,
});

export default connect(mapStateToProps)(ZulipApp);
