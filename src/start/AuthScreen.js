import React from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { connect } from 'react-redux';

import SafariView from 'react-native-safari-view';
import parseURL from 'url-parse';

import boundActions from '../boundActions';
import styles from '../common/styles';
import { Input, Screen, ZulipButton, GoogleButton } from '../common';
import { getAuth } from '../account/accountSelectors';
import { getCurrentRoute } from '../nav/routingSelectors';

import PasswordAuthView from './PasswordAuthView';

class AuthScreen extends React.PureComponent {

  props: {
    authBackends: string[],
  };

  componentDidMount = () => {
    Linking.addEventListener('url', this.handleOauthURL);
  }

  componentWillUnmount = () => {
    Linking.removeEventListener('url', this.handleOauthURL);
  }

  handleTypeSelect = (authType: string) => {
    const { realm } = this.props;

    if (authType === 'google') {
      this.handleOAuth(`${realm}/accounts/login/google/?is_mobile_flow=1`);
    } else if (authType === 'github') {
      this.handleOAuth(`${realm}/accounts/login/social/github`);
    } else {
      this.props.setAuthType(authType);
      this.props.pushRoute(authType);
    }
  }

  handleOAuth = (url) => {
    SafariView.show({ url });
  }

  handleOauthURL = (event) => {
    const { realm, loginSuccess } = this.props;

    SafariView.dismiss();

    const url = parseURL(event.url, true);

    // The OAuth callback should have the following format:
    // zulip://login?realm={}&api_key={}&email={}
    if (url.host === 'login') {
      const query = url.query;

      // Check for errors
      if (query.realm !== realm) {
        console.error('Zulip realm does not match request');
        return;
      }

      if (!query.email || !query.api_key) {
        console.error('No credentials in server response');
        return;
      }

      // Add the authenticated account
      loginSuccess(realm, query.email, query.api_key);
    }
  }

  render() {
    const { authBackends } = this.props;

    return (
      <Screen title="Sign in" keyboardAvoiding>
        <ScrollView
          centerContent
          keyboardShouldPersistTaps="always"
        >
          <View style={styles.container}>
            <Text style={[styles.field, styles.heading1]}>
              Welcome to Zulip!
            </Text>
            <Input
              customStyle={[styles.field, styles.disabled]}
              value={this.props.realm}
              editable={false}
            />
            {authBackends.includes('dev') &&
              <ZulipButton
                text="Sign in with dev account"
                onPress={() => this.handleTypeSelect('dev')}
              />
            }
            {authBackends.includes('password') && <PasswordAuthView />}
            {authBackends.includes('google') &&
              <GoogleButton
                onPress={() => this.handleTypeSelect('google')}
              />
            }
          </View>
        </ScrollView>
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    realm: getAuth(state).realm,
  }),
  boundActions,
)(AuthScreen);
