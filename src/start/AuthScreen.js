import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import styles from '../common/styles';
import { Input, Screen, ZulipButton } from '../common';
import { getAuth } from '../account/accountSelectors';
import { getCurrentRoute } from '../nav/routingSelectors';
import PasswordAuthView from './PasswordAuthView';
import GoogleSignInButton from './GoogleSignInButton';

class AuthScreen extends React.Component {

  props: {
    authBackends: string[],
  };

  handleTypeSelect = (authType: string) => {
    this.props.setAuthType(authType);
    this.props.pushRoute(authType);
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
            {authBackends.includes('google') && <GoogleSignInButton />}
          </View>
        </ScrollView>
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    authBackends: getCurrentRoute(state).data || [],
    realm: getAuth(state).realm,
  }),
  boundActions,
)(AuthScreen);
