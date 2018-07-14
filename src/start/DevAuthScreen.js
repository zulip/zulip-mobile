/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { ActivityIndicator, View, StyleSheet, FlatList } from 'react-native';

import type { Auth, Context, DevUser, Dispatch } from '../types';
import { ErrorMsg, Label, Screen, ZulipButton } from '../common';
import { devListUsers, devFetchApiKey } from '../api';
import { getAuth } from '../selectors';
import { loginSuccess } from '../actions';

const componentStyles = StyleSheet.create({
  accountItem: { height: 10 },
  heading: { flex: 0 },
  heading2: {
    fontSize: 20,
  },
  container: {
    flex: 1,
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});

type Props = {
  auth: Auth,
  dispatch: Dispatch,
};

type State = {
  progress: boolean,
  directAdmins: DevUser[],
  directUsers: DevUser[],
  error: string,
};

class DevAuthScreen extends PureComponent<Props, State> {
  context: Context;
  props: Props;
  state: State = {
    progress: false,
    directAdmins: [],
    directUsers: [],
    error: '',
  };

  static contextTypes = {
    styles: () => null,
  };

  componentDidMount = () => {
    const { auth } = this.props;
    this.setState({ progress: true, error: undefined });

    (async () => {
      try {
        const [directAdmins, directUsers] = await devListUsers(auth);

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
      this.props.dispatch(loginSuccess(auth.realm, email, apiKey, auth.realmIcon));
      this.setState({ progress: false });
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { styles } = this.context;
    const { directAdmins, directUsers, error, progress } = this.state;

    return (
      <Screen title="Pick a dev account">
        <View style={componentStyles.container}>
          {progress && <ActivityIndicator />}
          {!!error && <ErrorMsg error={error} />}
          <Label
            style={[styles.field, componentStyles.heading2, componentStyles.heading]}
            text="Administrators"
          />
          {directAdmins.map(admin => (
            <ZulipButton
              key={admin.email}
              text={admin.email}
              onPress={() => this.tryDevLogin(admin.email)}
            />
          ))}
          <Label
            style={[styles.field, componentStyles.heading2, componentStyles.heading]}
            text="Normal users"
          />
          <FlatList
            data={directUsers.map(user => user.email)}
            keyExtractor={(item, index) => item}
            ItemSeparatorComponent={() => <View style={componentStyles.accountItem} />}
            renderItem={({ item }) => (
              <ZulipButton
                key={item}
                text={item}
                secondary
                onPress={() => this.tryDevLogin(item)}
              />
            )}
          />
        </View>
      </Screen>
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
}))(DevAuthScreen);
