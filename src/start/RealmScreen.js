import React from 'react';
import { ScrollView, View, Keyboard } from 'react-native';

import { connect } from 'react-redux';

import boundActions from '../boundActions';
import styles from '../styles';
import { Label, Screen, ErrorMsg, ZulipButton, Input } from '../common';
import { getAuthBackends } from '../api';
import config from '../config';
import { fixRealmUrl } from '../utils/url';

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
    };
  }

  tryRealm = async () => {
    Keyboard.dismiss();

    let { realm } = this.state;

    // Automatically prepend 'https://' if the user does not enter a protocol
    if (realm.search(/\b(http|https):\/\//) === -1) {
      realm = `https://${realm}`;
    }

    realm = realm.replace(/\/$/, '');

    this.setState({
      realm: fixRealmUrl(realm),
      progress: true,
      error: undefined,
    });

    const { pushRoute, realmAdd } = this.props;

    try {
      const authBackends = await getAuthBackends({ realm });
      realmAdd(realm);
      pushRoute('auth', { authBackends });
    } catch (err) {
      this.setState({ error: 'Can not connect to server' });
    } finally {
      this.setState({ progress: false });
    }
  };

  render() {
    const { progress, realm, error } = this.state;

    return (
      <Screen title="Welcome" keyboardAvoiding>
        <ScrollView
          centerContent
          keyboardShouldPersistTaps="always"
        >
          <View style={styles.container}>
            <Label text="Your server URL" />
            <Input
              style={styles.field}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
              placeholder="Server URL"
              defaultValue={realm}
              onChangeText={value => this.setState({ realm: value })}
              blurOnSubmit={false}
              onSubmitEditing={this.tryRealm}
            />
            <ZulipButton
              text="Enter"
              progress={progress}
              onPress={this.tryRealm}
            />
            {error && <ErrorMsg error={error} />}
          </View>
        </ScrollView>
      </Screen>
    );
  }
}

export default connect(null, boundActions)(RealmScreen);
