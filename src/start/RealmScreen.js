/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, Keyboard } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { Label, Screen, ErrorMsg, ZulipButton, Input } from '../common';
import { getServerSettings } from '../api';
import { fixRealmUrl } from '../utils/url';

type Props = {
  actions: Actions,
  navigation: Object,
};

type State = {
  realm: string,
  error: ?string,
  progress: boolean,
};

class RealmScreen extends PureComponent<Props, State> {
  props: Props;
  state: State;
  scrollView: ScrollView;

  static contextTypes = {
    styles: () => null,
  };

  state = {
    progress: false,
    realm:
      (this.props.navigation &&
        this.props.navigation.state.params &&
        this.props.navigation.state.params.realm) ||
      '',
    error: undefined,
  };

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
      <Screen title="Welcome" padding scrollView>
        <Label text="Your server URL" />
        <Input
          style={styles.smallMarginTop}
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
        <ZulipButton
          style={styles.smallMarginTop}
          text="Enter"
          progress={progress}
          onPress={this.tryRealm}
        />
      </Screen>
    );
  }
}

export default connectWithActions(null)(RealmScreen);
