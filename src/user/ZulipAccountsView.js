import React from 'react';

import { connect } from 'react-redux';

import ZulipPasswordAuthView from './ZulipPasswordAuthView';
import ZulipDevAuthView from './ZulipDevAuthView';
import ZulipRealmView from './ZulipRealmView';

class ZulipAccountsView extends React.Component {

  render() {
    const { accounts, activeAccountId } = this.props;
    console.log('PROPS: ', this.props);
    if (activeAccountId) {
      const activeAccount = accounts[activeAccountId];
      if (activeAccount.authBackends.includes('dev')) {
        return <ZulipDevAuthView />;
      } else {
        return <ZulipPasswordAuthView />;
      }
    }

    return <ZulipRealmView />;
  }
}

const mapStateToProps = (state) => ({
  accounts: state.user.accounts,
  activeAccountId: state.user.activeAccountId,
});

export default connect(mapStateToProps)(ZulipAccountsView);
