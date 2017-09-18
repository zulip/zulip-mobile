/* @flow */
import React, { PureComponent } from 'react';

import { Text, View } from 'react-native';

import { connect } from 'react-redux';

import type { Actions, Auth } from '../types';
import boundActions from '../boundActions';
import { ErrorMsg, Screen, ZulipButton } from '../common';
import { devGetEmails, devFetchApiKey } from '../api';
import { getAuth } from '../selectors';

type State = {
  progress: boolean,
  directAdmins: string[],
  directUsers: string[],
  error: string,
};

class DevAuthScreen extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    actions: Actions,
    auth: Auth,
  };

  state: State = {
    progress: false,
    directAdmins: [],
    directUsers: [],
    error: '',
  };

  componentWillMount = () => {
    const { auth } = this.props;
    this.setState({ progress: true, error: undefined });

    (async () => {
      try {
        const [directAdmins, directUsers] = await devGetEmails(auth);

        this.setState({ directAdmins, directUsers, progress: false });
      } catch (err) {
        this.setState({ error: err.message });
      } finally {
        this.setState({ progress: false });
      }
    })();
  };

  tryDevLogin = async (email: string) => {
    const { auth } = this.props;

    this.setState({ progress: true, error: undefined });

    try {
      const apiKey = await devFetchApiKey(auth, email);
      this.props.actions.loginSuccess(auth.realm, email, apiKey);
      this.setState({ progress: false });
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { styles } = this.context;
    const { directAdmins, directUsers, error } = this.state;

    return (
      <Screen title="Pick a dev account">
        <View style={styles.container}>
          {error && <ErrorMsg error={error} />}
          <Text style={[styles.field, styles.heading2]}>Administrators</Text>
          {directAdmins.map(email => (
            <ZulipButton key={email} text={email} onPress={() => this.tryDevLogin(email)} />
          ))}
          <Text style={[styles.field, styles.heading2]}>Normal users</Text>
          {directUsers.map(email => (
            <ZulipButton
              key={email}
              text={email}
              secondary
              onPress={() => this.tryDevLogin(email)}
            />
          ))}
        </View>
      </Screen>
    );
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
  }),
  boundActions,
)(DevAuthScreen);
