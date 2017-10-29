/* @flow */
import React, { PureComponent } from 'react';
import { ActivityIndicator, Text, View, StyleSheet, FlatList } from 'react-native';

import type { Actions, Auth } from '../types';
import connectWithActions from '../connectWithActions';
import { ErrorMsg, Screen, ZulipButton } from '../common';
import { devGetEmails, devFetchApiKey } from '../api';
import { getAuth } from '../selectors';

const inlineStyles = StyleSheet.create({
  accountItem: { height: 10 },
  heading: { flex: 0 },
});

type Props = {
  actions: Actions,
  auth: Auth,
};

type State = {
  progress: boolean,
  directAdmins: string[],
  directUsers: string[],
  error: string,
};

class DevAuthScreen extends PureComponent<Props, State> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

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
    const { directAdmins, directUsers, error, progress } = this.state;

    return (
      <Screen title="Pick a dev account">
        <View style={styles.container}>
          {progress && <ActivityIndicator />}
          {error && <ErrorMsg error={error} />}
          <Label style={[styles.field, styles.heading2, inlineStyles.heading]} text="Administrators">
          {directAdmins.map(email => (
            <ZulipButton key={email} text={email} onPress={() => this.tryDevLogin(email)} />
          ))}
          <Label style={[styles.field, styles.heading2, inlineStyles.heading]} text="Normal users">
          <FlatList
            data={directUsers}
            keyExtractor={(item, index) => item}
            ItemSeparatorComponent={() => <View style={inlineStyles.accountItem} />}
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

export default connectWithActions(state => ({
  auth: getAuth(state),
}))(DevAuthScreen);
