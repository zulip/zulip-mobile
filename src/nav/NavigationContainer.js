import React from 'react';
import { connect } from 'react-redux';
import Navigation from './Navigation';
import { push, pop } from './navActions';
import { getActiveAccount } from '../accountlist/accountlistSelectors';

class NavigationContainer extends React.PureComponent {

  componentDidMount() {
    const { isLoggedIn, activeAccount, pushRoute } = this.props;

    if (isLoggedIn) {
      // try to login then go to main
    } else if (!activeAccount) {
      pushRoute({ key: 'accountlist', title: 'Account' });
    } else {
      pushRoute({ key: 'realm', title: 'Realm' });
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
    pushRoute: (route) => push(route),
    popRoute: () => pop(),
  }
)(NavigationContainer);
