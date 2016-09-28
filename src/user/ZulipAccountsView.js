import React from 'react';

import { connect } from 'react-redux';

import ZulipPasswordAuthView from './ZulipPasswordAuthView';
import ZulipDevAuthView from './ZulipDevAuthView';

import ZulipRealmView from './ZulipRealmView';

class ZulipAccountsView extends React.Component {

  render() {
    const { accounts, activeAccountId } = this.props;

    if (!activeAccountId) {
      return <ZulipRealmView />;
    }

    const activeAccount = accounts.get(activeAccountId);
    if (activeAccount.authBackends.includes('dev')) {
      return <ZulipDevAuthView />;
    } else {
      return <ZulipPasswordAuthView />;
    }
  }
}

const mapStateToProps = (state) => ({
  accounts: state.user.accounts,
  activeAccountId: state.user.activeAccountId,
});

export default connect(mapStateToProps)(ZulipAccountsView);
