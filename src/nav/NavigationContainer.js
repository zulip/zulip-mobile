import React from 'react';
import { connect } from 'react-redux';
import { getNextLoginRoute } from './routing';
import Navigation from './Navigation';
import { pushRoute, popRoute } from './navActions';
import { getActiveAccount } from '../accountlist/accountlistSelectors';

class NavigationContainer extends React.PureComponent {

  componentDidMount() {
    const { accounts, activeAccount, isLoggedIn } = this.props;
    if (isLoggedIn || (activeAccount && activeAccount.get('apiKey'))) {
      this.props.pushRoute({ key: 'main', title: 'Main' });
    } else {
      const nextRoute = getNextLoginRoute(accounts, activeAccount);
      this.props.pushRoute({ key: nextRoute, title: nextRoute });
    }
  }

  render() {
    return (
      <Navigation {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.app.get('isLoggedIn'),
  activeAccount: getActiveAccount(state),
  accounts: state.accountlist,
  navigation: state.nav,
});

export default connect(
  mapStateToProps, {
    pushRoute,
    popRoute,
  }
)(NavigationContainer);
