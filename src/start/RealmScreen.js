import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import styles from '../common/styles';
import { getAuth } from '../account/accountSelectors';
import { Screen, ErrorMsg, Button, Input } from '../common';
import { getAuthBackends } from '../api';
import config from '../config';
import AuthTypeScreen from './AuthTypeScreen';

type Props = {
  realm: ?string,
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
    let { realm } = this.state;
    if (realm.search(/\b(http|https):\/\//) === -1) {
      realm = `https://${realm}`;
    }

    this.setState({
      realm,
      progress: true,
      error: undefined,
    });

    try {
      const authBackends = await getAuthBackends({ realm });
      this.props.realmAdd(realm);
      if (authBackends.length === 1) {
        this.props.setAuthType(authBackends[0]);
        this.props.pushRoute(authBackends[0]);
      } else {
        this.setState({
          progress: false,
          authBackends,
        });
      }
    } catch (err) {
      this.setState({
        progress: false,
        error: err.message,
      });
    }
  };

  render() {
    const { authBackends, progress, realm, error } = this.state;

    return (
      <Screen title="Add Server" keyboardAvoiding>
        <Input
          customStyle={styles.fieldMargin}
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
    realm: getAuth(state).realm,
  }),
  boundActions,
)(RealmScreen);
