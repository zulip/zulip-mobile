import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Button } from '../common';

class AuthTypeScreen extends React.Component {

  props: {
    authBackends: string[],
  };

  handleTypeSelect = (authType: string) => {
    this.props.setAuthType(authType);
  }

  render() {
    const { authBackends } = this.props;

    return (
      <View>
        {authBackends.includes('dev')
          && <Button text="Dev Login" onPress={() => this.handleTypeSelect('dev')} />}
        {authBackends.includes('password')
          && <Button text="Login with Email" onPress={() => this.handleTypeSelect('password')} />}
        {authBackends.includes('google')
          && <Button text="Login with Google" onPress={() => this.handleTypeSelect('google')} />}
      </View>
    );
  }
}

export default connect((state) => ({}), boundActions)(AuthTypeScreen);
