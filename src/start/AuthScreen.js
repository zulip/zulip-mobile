import React from 'react';
import { ScrollView, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import styles from '../styles';
import { RawLabel, Screen, ZulipButton } from '../common';
import { getAuth } from '../account/accountSelectors';
import { getCurrentRoute } from '../nav/routingSelectors';

import PasswordAuthView from './PasswordAuthView';

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
            <RawLabel
              style={[styles.field]}
              text={this.props.realm}
              editable={false}
            />
            {authBackends.includes('dev') &&
              <ZulipButton
                text="Sign in with dev account"
                onPress={() => this.handleTypeSelect('dev')}
              />
            }
            {authBackends.includes('password') && <PasswordAuthView />}

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
