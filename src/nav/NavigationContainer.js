import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { checkCompatibility } from '../api';
import { getInitialRoutes } from './routingSelectors';
import Navigation from './Navigation';

class NavigationContainer extends React.PureComponent {

  state = {
    compatibilityCheckFail: false,
  };

  componentDidMount() {
    const { accounts } = this.props;
    this.props.initRoutes(getInitialRoutes(accounts));

    // check with server if current mobile app is compatible with latest backend
    // compatibility fails only if server responds with 400 (but not with 200 or 404)
    checkCompatibility().then(res =>
      this.setState({ compatibilityCheckFail: res.status === 400 })
    );
  }

  render() {
    return (
      <Navigation
        {...this.props}
        compatibilityCheckFail={this.state.compatibilityCheckFail}
      />
    );
  }
}

export default connect(
  (state) => ({
    isLoggedIn: state.app.isLoggedIn,
    accounts: state.account,
    navigation: state.nav,
  }),
  boundActions,
)(NavigationContainer);
