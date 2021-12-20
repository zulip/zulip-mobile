/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { ComponentType } from 'react';
import { ActivityIndicator, View, FlatList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { DevUser, Dispatch } from '../types';
import styles, { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { ErrorMsg, ZulipTextIntl, Screen, ZulipButton } from '../common';
import * as api from '../api';
import { loginSuccess } from '../actions';

const componentStyles = createStyleSheet({
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

type OuterProps = $ReadOnly<{|
  // These should be passed from React Navigation
  navigation: AppNavigationProp<'dev-auth'>,
  route: RouteProp<'dev-auth', {| realm: URL |}>,
|}>;

type SelectorProps = $ReadOnly<{||}>;

type Props = $ReadOnly<{|
  ...OuterProps,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

type State = {|
  progress: boolean,
  directAdmins: DevUser[],
  directUsers: DevUser[],
  error: string,
|};

class DevAuthScreenInner extends PureComponent<Props, State> {
  state = {
    progress: false,
    directAdmins: [],
    directUsers: [],
    error: '',
  };

  componentDidMount = () => {
    const realm = this.props.route.params.realm;
    this.setState({ progress: true, error: undefined });

    (async () => {
      try {
        const response = await api.devListUsers({ realm, apiKey: '', email: '' });
        this.setState({
          directAdmins: response.direct_admins,
          directUsers: response.direct_users,
          progress: false,
        });
      } catch (err) {
        this.setState({ error: err.data && err.data.msg });
      } finally {
        this.setState({ progress: false });
      }
    })();
  };

  tryDevLogin = async (email: string) => {
    const realm = this.props.route.params.realm;

    this.setState({ progress: true, error: undefined });

    try {
      const { api_key } = await api.devFetchApiKey({ realm, apiKey: '', email }, email);
      this.props.dispatch(loginSuccess(realm, email, api_key));
      this.setState({ progress: false });
    } catch (err) {
      this.setState({ progress: false, error: err.data && err.data.msg });
    }
  };

  render() {
    const { directAdmins, directUsers, error, progress } = this.state;

    return (
      <Screen title="Pick a dev account" shouldShowLoadingBanner={false}>
        <View style={componentStyles.container}>
          {progress && <ActivityIndicator />}
          {!!error && <ErrorMsg error={error} />}
          <ZulipTextIntl
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
          <ZulipTextIntl
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

const DevAuthScreen: ComponentType<OuterProps> = connect<{||}, _, _>()(DevAuthScreenInner);

export default DevAuthScreen;
