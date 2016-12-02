import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getInitialRoutes } from './routingSelectors';
import Navigation from './Navigation';

class NavigationContainer extends React.PureComponent {

  componentDidMount() {
    const { accounts } = this.props;
    this.props.initRoutes(getInitialRoutes(accounts));
  }

  render() {
    return (
      <Navigation {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.app.isLoggedIn,
  accounts: state.account,
  navigation: state.nav,
});

export default connect(
  mapStateToProps, boundActions)(NavigationContainer);
