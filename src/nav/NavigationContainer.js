import React from 'react';
import { connect } from 'react-redux';
import { getInitialRoutes } from './routing';
import Navigation from './Navigation';
import { pushRoute, popRoute, initRoutes } from './navActions';
import { getActiveAccount } from '../accountlist/accountlistSelectors';

class NavigationContainer extends React.PureComponent {

  componentDidMount() {
    const { accounts, activeAccount } = this.props;
    this.props.initRoutes(getInitialRoutes(accounts, activeAccount));
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
    initRoutes,
    pushRoute,
    popRoute,
  }
)(NavigationContainer);
