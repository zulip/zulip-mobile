/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import { ErrorMsg, Label, SmartUrlInput, Screen, ZulipButton } from '../common';
import { tryParseUrl } from '../utils/url';
import * as api from '../api';
import { navigateToAuth } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'realm-input'>,
  route: RouteProp<'realm-input', {| initial: boolean | void |}>,
|}>;

type State = {|
  realmInputValue: string,
  error: string | null,
  progress: boolean,
|};

/**
 * A screen for entering a server URL to connect to, before authenticating.
 *
 * Pads the horizontal insets with its background.
 */
export default class RealmInputScreen extends PureComponent<Props, State> {
  state: State = {
    progress: false,
    realmInputValue: '',
    error: null,
  };

  tryRealm: () => Promise<void> = async () => {
    const { realmInputValue } = this.state;

    const parsedRealm = tryParseUrl(realmInputValue);
    if (!parsedRealm) {
      this.setState({ error: 'Please enter a valid URL' });
      return;
    }
    if (parsedRealm.username !== '') {
      this.setState({ error: 'Please enter the server URL, not your email' });
      return;
    }

    this.setState({
      progress: true,
      error: null,
    });
    try {
      const serverSettings: ApiResponseServerSettings = await api.getServerSettings(parsedRealm);
      NavigationService.dispatch(navigateToAuth(serverSettings));
      Keyboard.dismiss();
    } catch (err) {
      this.setState({ error: 'Cannot connect to server' });
      /* eslint-disable no-console */
      console.warn('RealmInputScreen: failed to connect to server:', err);
      console.warn(err.stack);
    } finally {
      this.setState({ progress: false });
    }
  };

  handleRealmChange: string => void = value => this.setState({ realmInputValue: value });

  render(): Node {
    const { navigation } = this.props;
    const { progress, error, realmInputValue } = this.state;

    const styles = {
      input: { marginTop: 16, marginBottom: 8 },
      hintText: { paddingLeft: 2, fontSize: 12 },
      button: { marginTop: 8 },
    };

    return (
      <Screen
        title="Welcome"
        canGoBack={!this.props.route.params.initial}
        padding
        centerContent
        keyboardShouldPersistTaps="always"
        shouldShowLoadingBanner={false}
      >
        <SafeAreaView mode="padding" edges={['right', 'left']}>
          <Label text="Enter your Zulip server URL:" />
          <SmartUrlInput
            style={styles.input}
            navigation={navigation}
            defaultProtocol="https://"
            defaultOrganization="your-org"
            defaultDomain="zulipchat.com"
            onChangeText={this.handleRealmChange}
            onSubmitEditing={this.tryRealm}
            enablesReturnKeyAutomatically
          />
          {error !== null ? (
            <ErrorMsg error={error} />
          ) : (
            <Label text="e.g. zulip.example.com" style={styles.hintText} />
          )}
          <ZulipButton
            style={styles.button}
            text="Enter"
            progress={progress}
            onPress={this.tryRealm}
            disabled={tryParseUrl(realmInputValue) === undefined}
          />
        </SafeAreaView>
      </Screen>
    );
  }
}
