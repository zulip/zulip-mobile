import React from 'react';
import {
  View,
  ActivityIndicator,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  addAccount,
} from './userActions';

// import { Backend } from '../api/apiClient';
import styles from '../common/styles';
import ZulipLogo from '../common/ZulipLogo';
// import ZulipButton from '../common/ZulipButton';
import ZulipPasswordAuthView from './ZulipPasswordAuthView';
import ZulipDevAuthView from './ZulipDevAuthView';
import ZulipRealmView from './ZulipRealmView';

class ZulipAccountsView extends React.Component {

  props: {
    realm: string,
    authBackends: string[],
  };

  componentWillMount() {
    const { auth, realm, email, password, authBackends } = this.props;

    if (!realm) return;

    if (!authBackends.size) {
      this.props.addAccount(realm);
    }

    if (authBackends.size && password) {
      this.props.attemptLogin(
        auth,
        email,
        password,
      );
    }
  }

  render() {
    const { authBackends, realm } = this.props;
    const isRealmSet = !!realm;

    return (
      <View style={styles.container}>
        <ZulipLogo />
        {!isRealmSet && <ZulipRealmView />}
        {isRealmSet && !authBackends.size && <ActivityIndicator />}
        {isRealmSet && authBackends.includes('dev') && <ZulipDevAuthView />}
        {isRealmSet && authBackends.includes('password') && <ZulipPasswordAuthView />}
        {/* {isRealmSet && authBackends.includes('google')
          && <ZulipButton text="Login with Google" />} */}
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    addAccount,
  }, dispatch);

const mapStateToProps = (state) => ({
  auth: state.auth,
  realm: state.auth.get('realm'),
  email: state.auth.get('email'),
  password: state.auth.get('password'),
  activeBackend: state.user.get('activeBackend'),
  authBackends: state.user.get('authBackends'),
});

export default connect(mapStateToProps, mapDispatchToProps)(ZulipAccountsView);
