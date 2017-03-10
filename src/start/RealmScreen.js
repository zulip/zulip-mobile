import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import styles from '../common/styles';
import { Screen, ErrorMsg, ZulipButton, Input } from '../common';
import { getAuthBackends } from '../api';
import config from '../config';

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
    let { realm } = this.state;

    // Automatically prepend 'https://' if the user does not enter a protocol
    if (realm.search(/\b(http|https):\/\//) === -1) {
      realm = `https://${realm}`;
    }

    this.setState({
      realm,
      progress: true,
      error: undefined,
    });

    const { pushRoute, realmAdd } = this.props;

    try {
      const authBackends = await getAuthBackends({ realm });
      console.log('AUTH BACKENDS', authBackends);
      realmAdd(realm);
      pushRoute('auth', authBackends);
    } catch (err) {
      this.setState({ error: err.message });
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
            <Text style={[styles.field, styles.heading1]}>
              Welcome to Zulip!
            </Text>
            <Text style={[styles.field, styles.label]}>
              Please enter your server URL
            </Text>
            <Input
              customStyle={styles.field}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
              placeholder="Server URL"
              defaultValue={realm}
              onChangeText={value => this.setState({ realm: value })}
              blurOnSubmit={false}
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
