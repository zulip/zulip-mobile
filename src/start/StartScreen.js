import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  addAccount,
} from '../account/accountActions';

import styles, { BRAND_COLOR } from '../common/styles';
import Logo from '../common/Logo';
import AccountPickScreen from '../accountlist/AccountPickScreen';
import PasswordAuthScreen from './PasswordAuthScreen';
import DevAuthScreen from './DevAuthScreen';

type Props = {
  realm: string,
  authBackends: string[],
};

class StartScreen extends React.Component {

  props: Props;

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

  handleBackAction = () =>
    this.handleAction({ type: 'pop' });

  renderScene = (key) => <Text>Hello</Text>;

  render() {
    const { authBackends, realm } = this.props;
    const isRealmSet = !!realm;

    return (
      <View style={styles.container}>
        <Logo />

        {/* {!isRealmSet && <AccountPickScreen />}
        {isRealmSet && !authBackends.size && <ActivityIndicator color={BRAND_COLOR} />}
        {isRealmSet && authBackends.includes('dev') && <DevAuthScreen />}
        {isRealmSet && authBackends.includes('password') && <PasswordAuthScreen />} */}

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
  accounts: [],
});

export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);
