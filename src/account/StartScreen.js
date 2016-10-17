import React from 'react';
import {
  View,
  ActivityIndicator,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  addAccount,
} from './accountActions';

// import { Backend } from '../api/apiClient';
import styles, { BRAND_COLOR } from '../common/styles';
import Logo from '../common/Logo';
import PasswordAuthScreen from './PasswordAuthScreen';
import DevAuthScreen from './DevAuthScreen';
import AccountPickScreen from './AccountPickScreen';

class StartScreen extends React.Component {

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
        <Logo />
        {!isRealmSet && <AccountPickScreen />}
        {isRealmSet && !authBackends.size && <ActivityIndicator color={BRAND_COLOR} />}
        {isRealmSet && authBackends.includes('dev') && <DevAuthScreen />}
        {isRealmSet && authBackends.includes('password') && <PasswordAuthScreen />}
        {/* {isRealmSet && authBackends.includes('google')
          && <Button text="Login with Google" />} */}
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

export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);
