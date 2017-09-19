/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, View, StyleSheet, Keyboard } from 'react-native';
import { connect } from 'react-redux';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { Label, Screen, ErrorMsg, ZulipButton, Input } from '../common';
import { getServerSettings } from '../api';
import { fixRealmUrl } from '../utils/url';

type Props = {
  actions: Actions,
};

type State = {
  realm: string,
  error: ?string,
  progress: boolean,
};

const componentStyles = StyleSheet.create({
  realm: {
    padding: 20,
  },
  spacer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});

class RealmScreen extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;
  state: State;
  scrollView: ScrollView;

  constructor(props) {
    super(props);
    const { realm } = props.navigation.state.params || '';
    this.state = {
      progress: false,
      realm,
      error: undefined,
    };
  }

  tryRealm = async () => {
    const { realm } = this.state;
    const fixRealm = fixRealmUrl(realm);
    this.setState({
      realm: fixRealm,
      progress: true,
      error: undefined,
    });

    const { actions } = this.props;

    try {
      const serverSettings = await getServerSettings({ realm: fixRealm });

      actions.realmAdd(fixRealm);
      actions.navigateToAuth(serverSettings);
      Keyboard.dismiss();
    } catch (err) {
      this.setState({ error: err.message });
    } finally {
      this.setState({ progress: false });
    }
  };

  render() {
    const { styles } = this.context;
    const { progress, realm, error } = this.state;

    return (
      <Screen title="Welcome">
        <View style={componentStyles.realm}>
          <Label text="Your server URL" />
          <Input
            style={styles.field}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Server URL"
            returnKeyType="go"
            defaultValue={realm}
            onChangeText={value => this.setState({ realm: value })}
            blurOnSubmit={false}
            keyboardType="url"
            onSubmitEditing={this.tryRealm}
          />

          {error && <ErrorMsg error={error} />}
        </View>
        <View style={componentStyles.spacer}>
          <ZulipButton text="Enter" fullSize progress={progress} onPress={this.tryRealm} />
        </View>
      </Screen>
    );
  }
}

export default connect(null, boundActions)(RealmScreen);
