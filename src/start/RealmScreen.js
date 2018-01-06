/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, Keyboard, StyleSheet } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { Label, Screen, ErrorMsg, ZulipButton, Input, WebLink } from '../common';
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

const customStyles = StyleSheet.create({
  heading: {
    marginBottom: 32,
  },
  newOrgLink: {
    marginTop: 24,
  },
  newOrgLinkLabel: {
    textAlign: 'center',
  },
});

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
        <Label
          text="Register or log in to a Zulip organization to get started."
          style={[styles.heading2, customStyles.heading]}
        />
        <Label text="URL of Zulip organization" />
        <Input
          style={styles.smallMarginTop}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="your-organization.zulipchat.com"
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
        <WebLink
          style={customStyles.newOrgLink}
          labelStyle={customStyles.newOrgLinkLabel}
          label="Or create a new organization on zulipchat.com."
          href="https://zulipchat.com/create_realm/"
        />
      </Screen>
    );
  }
}

export default connectWithActions(null)(RealmScreen);
