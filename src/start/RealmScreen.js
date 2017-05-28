import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  Keyboard } from 'react-native';
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

const moreStyles = StyleSheet.create({
  container: {
    paddingBottom: 25,
  },
});


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
      Keyboard.dismiss();
    } catch (err) {
      this.setState({ error: 'Can not connect to server' });
    } finally {
      this.setState({ progress: false });
    }
  };

  render() {
    const { progress, realm, error } = this.state;

    return (
      <Screen title="Welcome to Zulip" keyboardAvoiding>
        <ScrollView
          ref={(scrollView) => { this.scrollView = scrollView; }}
          centerContent
          keyboardShouldPersistTaps="always"
          onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}
        >
          <View style={[styles.container, moreStyles.container]}>
            <Image style={[styles.image]} source={require('../../static/img/bus.png')} />
            <Label text="Server URL" />
            <Input
              style={styles.field}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
              placeholder="https://your-server-url.zulipchat.com"
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
