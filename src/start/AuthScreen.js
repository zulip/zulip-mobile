/* @flow */
import React, { PureComponent } from 'react';

import { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { Centerer, Screen, ZulipButton } from '../common';
import { getCurrentRealm } from '../selectors';
import RealmInfo from './RealmInfo';
import PasswordAuthView from './PasswordAuthView';
import OAuthView from './OAuthView';
import { getFullUrl } from '../utils/url';
import { IconPrivate, IconGoogle, IconGitHub } from '../common/Icons';

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
            <ZulipButton text="Log in with dev account" onPress={this.handleDevAuth} />
          )}
          {(serverSettings.authentication_methods.password ||
            serverSettings.authentication_methods.ldap) && (
            <PasswordAuthView ldap={serverSettings.authentication_methods.ldap} />
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
