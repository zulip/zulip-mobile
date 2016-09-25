import React from 'react';
import {
  View,
  AsyncStorage,
  InteractionManager,
} from 'react-native';

import { connect } from 'react-redux';

import MainView from './main/MainView';
import ZulipAccountsView from './user/ZulipAccountsView';
import ZulipMainView from './nav/ZulipMainView';

const ZulipApp = (props) => {
  return props.loggedIn ? <MainView /> : <ZulipAccountsView />;
};

const mapStateToProps = (state) => ({
  loggedIn: state.user.accounts.some((account) => account.loggedIn) &&
            state.user.activeAccountId !== null,
});

export default connect(mapStateToProps)(ZulipApp);
