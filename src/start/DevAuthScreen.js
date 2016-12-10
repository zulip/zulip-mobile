import React from 'react';
import {
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';

import { Auth } from '../types';
import boundActions from '../boundActions';
import { Screen, ErrorMsg, Button } from '../common';
import { devGetEmails, devFetchApiKey } from '../api';
import { getAuth } from '../account/accountSelectors';

type State = {
  progress: boolean,
  directAdmins: string[],
  directUsers: string[],
}

class DevAuthScreen extends React.Component {

  props: {
    auth: Auth,
  };

  state: State = {
    progress: false,
    directAdmins: [],
    directUsers: [],
  };

  componentWillMount = async () => {
    const { auth } = this.props;

    this.setState({ progress: true, error: undefined });

    try {
      const [directAdmins, directUsers] = await devGetEmails(auth);

      this.setState({ directAdmins, directUsers, progress: false });
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  }

  tryDevLogin = async (email: string) => {
    const { auth } = this.props;

    this.setState({ progress: true, error: undefined });

    try {
      const apiKey = await devFetchApiKey(auth, email);
      this.props.loginSuccess(auth.realm, email, apiKey);
      this.setState({ progress: false });
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { directAdmins, directUsers, error } = this.state;

    return (
      <Screen title="Dev Account Login">
        <ScrollView>
          {directAdmins.map((email) =>
            <Button
              key={email}
              text={email}
              onPress={() => this.tryDevLogin(email)}
            />
          )}
          {directUsers.map((email) =>
            <Button
              key={email}
              text={email}
              secondary
              onPress={() => this.tryDevLogin(email)}
            />
          )}
        </ScrollView>
        <ErrorMsg error={error} />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
  }),
  boundActions,
)(DevAuthScreen);
