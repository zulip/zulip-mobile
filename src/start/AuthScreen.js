/* @flow */
import React, { PureComponent } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { Action, Actions } from '../types';
import boundActions from '../boundActions';
import { Centerer, RawLabel, Screen, ZulipButton } from '../common';
import { getCurrentRealm } from '../selectors';
import PasswordAuthView from './PasswordAuthView';
import OAuthView from './OAuthView';
import { getFullUrl } from '../utils/url';

const componentStyles = StyleSheet.create({
  description: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 20,
  },
});

class AuthScreen extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    realm: string,
    setAuthType: Action,
    navigation: Object,
    navigateToDev: () => void,
    actions: Actions,
  };

  handleDevAuth = () => {
    this.props.actions.setAuthType('dev');
    this.props.actions.navigateToDev();
  };

  render() {
    const { serverSettings } = this.props.navigation.state.params;

    return (
      <Screen title="Sign in" padding>
        <Centerer>
          <View style={componentStyles.description}>
            {serverSettings.realm_icon && (
              <Image
                style={componentStyles.icon}
                source={{
                  uri: getFullUrl(serverSettings.realm_icon, this.props.realm),
                }}
              />
            )}
            <RawLabel style={componentStyles.name} text={serverSettings.realm_name} />
          </View>
          {serverSettings.authentication_methods.dev && (
            <ZulipButton text="Sign in with dev account" onPress={this.handleDevAuth} />
          )}
          {serverSettings.authentication_methods.password && <PasswordAuthView />}
          {serverSettings.authentication_methods.google && (
            <OAuthView name="Google" icon="logo-google" url="accounts/login/google/" />
          )}
          {serverSettings.authentication_methods.github && (
            <OAuthView name="GitHub" icon="logo-github" url="accounts/login/social/github" />
          )}
        </Centerer>
      </Screen>
    );
  }
}

export default connect(
  state => ({
    realm: getCurrentRealm(state),
  }),
  boundActions,
)(AuthScreen);
