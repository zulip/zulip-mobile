import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import config from '../config';

// Actions
import { markErrorsAsHandled } from '../error/errorActions';
import {
  addAccount,
} from './userActions';

import ZulipPasswordAuthView from './ZulipPasswordAuthView';
import ZulipDevAuthView from './ZulipDevAuthView';
import ZulipRealmView from './ZulipRealmView';

class ZulipAccountsView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      realm: process.env.NODE_ENV === 'development' ? config.devRealm : config.productionRealm,
    };
  }

  onRealmEnter = () => {
    this.props.markErrorsAsHandled(this.props.errors);
    this.props.addAccount(this.state.realm);
  }

  render() {
    const { accounts, activeAccountId } = this.props;

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
  pendingServerResponse: state.user.pendingServerResponse,
  errors: state.errors.filter(e => e.active),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    addAccount,
    markErrorsAsHandled,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ZulipAccountsView);
