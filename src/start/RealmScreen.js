import React from 'react';
import { TextInput } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { styles, Screen, ErrorMsg, Button } from '../common';
import { getAuthBackends } from '../api';
import config from '../config';
import AuthTypeScreen from './AuthTypeScreen';

type Props = {
  realm: ?string,
  navigateTo: (route: string) => void,
}

class RealmScreen extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);

    const realmFromConfig = process.env.NODE_ENV === 'development'
      ? config.devRealm
      : config.productionRealm;
    this.state = {
      progress: false,
      realm: props.realm || realmFromConfig,
      authBackends: [],
    };
  }

  tryRealm = async () => {
    const { realm, realmAdd } = this.state;

    this.setState({ progress: true, error: undefined });

    try {
      const authBackends = await getAuthBackends({ realm });
      realmAdd(realm);
      if (authBackends.length === 1) {
        this.props.setAuthType(authBackends[0]);
        this.props.navigateTo(authBackends[0]);
      } else {
        this.setState({ progress: false, authBackends });
      }
    } catch (err) {
      this.setState({ progress: false, error: err.message });
    }
  };

  render() {
    const { authBackends, progress, realm, error } = this.state;

    return (
      <Screen title="Add Server" keybardAvoiding>
        <TextInput
          style={styles.input}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="Server address"
          defaultValue={realm}
          onChangeText={value => this.setState({ realm: value })}
        />
        <Button
          text="Sign in"
          progress={progress}
          onPress={this.tryRealm}
        />
        <ErrorMsg error={error} />
        {authBackends.length > 0 &&
          <AuthTypeScreen authBackends={authBackends} />}
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    realm: getAuth(state).get('realm'),
  }),
  boundActions,
)(RealmScreen);
