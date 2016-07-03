import React from 'react-native';

import { connect } from 'react-redux';

// UI elements
import ZulipAccountsView from './user/ZulipAccountsView';

import ZulipNavBar from './nav/ZulipNavBar';
import ZulipStreamView from './stream/ZulipStreamView';
import ZulipComposeBar from './compose/ZulipComposeBar';

const ZulipApp = (props) => {
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
  loggedIn: state.user.accounts.some((account) => account.loggedIn),
});

export default connect(mapStateToProps)(ZulipApp);
