import React from 'react';
import { connect } from 'react-redux';
import { getNextLoginRoute } from './routing';
import Navigation from './Navigation';
import { pushRoute, popRoute } from './navActions';
import { getActiveAccount } from '../accountlist/accountlistSelectors';

class NavigationContainer extends React.PureComponent {

  componentDidMount() {
    const { accounts, activeAccount } = this.props;
    const isLoggedIn = activeAccount && activeAccount.get('apiKey');

    if (isLoggedIn) {
      // try to login then go to main
      this.props.pushRoute({ key: 'main', title: 'Main' });
    } else {
      const nextRoute = getNextLoginRoute(accounts, activeAccount);
      this.props.pushRoute(nextRoute);
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
