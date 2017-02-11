import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import styles from '../common/styles';
import { ZulipButton, Screen } from '../common';
import { getCurrentRoute } from '../nav/routingSelectors';

class AuthTypeScreen extends React.Component {

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
      <Screen title="Pick Auth Type" padded>
        <View>
          {authBackends.includes('dev') &&
            <ZulipButton
              text="Dev Login"
              customStyles={styles.marginBottom}
              onPress={() => this.handleTypeSelect('dev')}
            />
          }
          {authBackends.includes('password') &&
            <ZulipButton
              text="Login with Email"
              customStyles={styles.marginBottom}
              onPress={() => this.handleTypeSelect('password')}
            />
          }
          {authBackends.includes('google') &&
            <ZulipButton
              text="Login with Google"
              customStyles={styles.marginBottom}
              onPress={() => this.handleTypeSelect('google')}
            />
          }
        </View>
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    authBackends: getCurrentRoute(state).data || [],
  }),
  boundActions,
)(AuthTypeScreen);
