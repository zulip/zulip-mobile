/* @flow */
import React, { PureComponent } from 'react';

import { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { Centerer, Screen } from '../common';
import { getCurrentRealm } from '../selectors';
import RealmInfo from './RealmInfo';
import AuthButton from './AuthButton';
import OAuthView from './OAuthView';
import { getFullUrl } from '../utils/url';
import { IconPrivate, IconGoogle, IconGitHub, IconTerminal } from '../common/Icons';

type Props = {
  actions: Actions,
  realm: string,
  navigation: Object,
};

class AuthScreen extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  handleDevAuth = () => {
    this.props.actions.navigateToDev();
  };

  handlePassword = () => {
    const { actions, navigation } = this.props;
    actions.navigateToPassword(navigation.state.params.serverSettings.authentication_methods.ldap);
  };

  render() {
    const { serverSettings } = this.props.navigation.state.params;

    return (
      <Screen title="Log in" padding>
        <Centerer>
          <RealmInfo
            name={serverSettings.realm_name}
            iconUrl={getFullUrl(serverSettings.realm_icon, this.props.realm)}
          />
          {serverSettings.authentication_methods.dev && (
            <AuthButton name="dev account" Icon={IconTerminal} onPress={this.handleDevAuth} />
          )}
          {(serverSettings.authentication_methods.password ||
            serverSettings.authentication_methods.ldap) && (
            <AuthButton name="password" Icon={IconPrivate} onPress={this.handlePassword} />
          )}
          {serverSettings.authentication_methods.google && (
            <OAuthView name="Google" Icon={IconGoogle} url="accounts/login/google/" />
          )}
          {serverSettings.authentication_methods.github && (
            <OAuthView name="GitHub" Icon={IconGitHub} url="accounts/login/social/github" />
          )}
          {serverSettings.authentication_methods.remoteuser && (
            <OAuthView name="SSO" Icon={IconPrivate} url="accounts/login/sso" />
          )}
        </Centerer>
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  realm: getCurrentRealm(state),
}))(AuthScreen);
