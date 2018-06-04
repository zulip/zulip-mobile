/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { ActivityIndicator, View, StyleSheet, SectionList } from 'react-native';

import type { Auth, Context, DevUser, Dispatch, GlobalState } from '../types';
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

type Props = {|
  auth: Auth,
  dispatch: Dispatch,
|};

type State = {|
  progress: boolean,
  directAdmins: DevUser[],
  directUsers: DevUser[],
  error: string,
|};

class DevAuthScreen extends PureComponent<Props, State> {
  context: Context;
  state = {
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
        const response = await devListUsers(auth);
        this.setState({
          directAdmins: response.direct_admins,
          directUsers: response.direct_users,
          progress: false,
        });
      } catch (err) {
        this.setState({ error: err.message });
      } finally {
        this.setState({ progress: false });
      }
    })();
  };

  tryDevLogin = async (user: DevUser) => {
    const { email, realm_uri } = user;

    this.setState({ progress: true, error: undefined });

    try {
      const apiKey = await devFetchApiKey({ realm: realm_uri, email, apiKey: '' }, email);
      this.props.dispatch(loginSuccess(realm_uri, email, apiKey));
      this.setState({ progress: false });
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { styles } = this.context;
    const { directAdmins, directUsers, error, progress } = this.state;
    const sections = [
      { title: 'Administrators', data: directAdmins },
      { title: 'Normal users', data: directUsers },
    ];
    return (
      <Screen title="Pick a dev account">
        <View style={componentStyles.container}>
          {progress && <ActivityIndicator />}
          {!!error && <ErrorMsg error={error} />}
          <SectionList
            stickySectionHeadersEnabled
            keyboardShouldPersistTaps="always"
            ItemSeparatorComponent={() => <View style={componentStyles.accountItem} />}
            sections={sections}
            keyExtractor={item => `${item.email}${item.realm_uri}`}
            renderItem={({ item, index, section }) => (
              <ZulipButton
                text={`${item.email} (${
                  item.realm_uri
                    .split('http://')[1]
                    .split('.')[0]
                    .split(':')[0]
                })`}
                secondary={section.title !== 'Administrators'}
                onPress={() => this.tryDevLogin(item)}
              />
            )}
            renderSectionHeader={({ section }) => (
              <Label
                style={[styles.field, componentStyles.heading2, componentStyles.heading]}
                text={section.title}
              />
            )}
          />
        </View>
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  auth: getAuth(state),
}))(DevAuthScreen);
