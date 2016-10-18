import React from 'react';
import {
  View,
} from 'react-native';
import { Button } from '../common';

export default class AuthBackendPicker extends React.Component {

  props: {
    authBackends: string[],
    navigateTo: (route: string) => void,
  };

  render() {
    const { authBackends, navigateTo } = this.props;

    return (
      <View>
        {authBackends.includes('dev')
          && <Button text="Dev Login" onPress={() => navigateTo('dev')} />}
        {authBackends.includes('password')
          && <Button text="Login with Email" onPress={() => navigateTo('password')} />}
        {authBackends.includes('google')
          && <Button text="Login with Google" onPress={() => navigateTo('google')} />}
      </View>
    );
  }
}
