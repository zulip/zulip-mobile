import React from 'react';
import { connect } from 'react-redux';
import { getInitialRoutes } from './routingSelectors';
import Navigation from './Navigation';
import { pushRoute, popRoute, initRoutes } from './navActions';

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
  isLoggedIn: state.app.get('isLoggedIn'),
  accounts: state.account,
  navigation: state.nav,
});

export default connect(
  mapStateToProps, {
    initRoutes,
    pushRoute,
    popRoute,
  }
)(NavigationContainer);
