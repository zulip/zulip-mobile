/* @flow strict-local */
import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { Keyboard } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import ErrorMsg from '../common/ErrorMsg';
import ZulipTextIntl from '../common/ZulipTextIntl';
import SmartUrlInput from '../common/SmartUrlInput';
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';
import { tryParseUrl } from '../utils/url';
import * as api from '../api';
import { navigateToAuth } from '../actions';
import { useClipboardHasURL } from '../@react-native-clipboard/clipboard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'realm-input'>,
  route: RouteProp<'realm-input', {| initial: boolean | void |}>,
|}>;

const urlFromInputValue = (realmInputValue: string): URL | void => {
  const withScheme = /^https?:\/\//.test(realmInputValue)
    ? realmInputValue
    : `https://${realmInputValue}`;

  return tryParseUrl(withScheme);
};

export default function RealmInputScreen(props: Props): Node {
  const { navigation } = props;

  const [progress, setProgress] = useState<boolean>(false);

  // Prepopulate with "https://"; not everyone has memorized that sequence
  // of characters.
  const [realmInputValue, setRealmInputValue] = useState<string>('');

  const [error, setError] = useState<string | null>(null);

  const tryRealm = useCallback(async unparsedUrl => {
    const parsedRealm = urlFromInputValue(unparsedUrl);
    if (!parsedRealm) {
      setError('Please enter a valid URL');
      return;
    }
    if (parsedRealm.username !== '') {
      setError('Please enter the server URL, not your email');
      return;
    }

    setProgress(true);
    setError(null);
    try {
      const serverSettings: ApiResponseServerSettings = await api.getServerSettings(parsedRealm);
      NavigationService.dispatch(navigateToAuth(serverSettings));
      Keyboard.dismiss();
    } catch (errorIllTyped) {
      const err: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
      setError('Cannot connect to server');
      /* eslint-disable no-console */
      console.warn('RealmInputScreen: failed to connect to server:', err);
      // $FlowFixMe[incompatible-cast]: assuming caught exception was Error
      console.warn((err: Error).stack);
    } finally {
      setProgress(false);
    }
  }, []);

  const handleInputSubmit = useCallback(() => {
    tryRealm(realmInputValue);
  }, [tryRealm, realmInputValue]);

  const styles = {
    input: { marginTop: 16, marginBottom: 8 },
    hintText: { paddingLeft: 2, fontSize: 12 },
    button: { marginTop: 8 },
  };

  const tryCopiedUrl = useCallback(async () => {
    // The copied string might not be a valid realm URL:
    // - It might not be a URL because useClipboardHasURL is subject to
    //   races (and Clipboard.getString is itself async).
    // - It might not be a valid Zulip realm that the client can connect to.
    //
    // So…
    const url = await Clipboard.getString();

    // …let the user see what string is being tried and edit it if it fails…
    setRealmInputValue(url);

    // …and run it through our usual validation.
    await tryRealm(url);
  }, [tryRealm]);

  const clipboardHasURL = useClipboardHasURL();

  return (
    <Screen
      title="Welcome"
      canGoBack={!props.route.params.initial}
      padding
      centerContent
      keyboardShouldPersistTaps="always"
      shouldShowLoadingBanner={false}
    >
      <ZulipTextIntl text="Enter your Zulip server URL:" />
      <SmartUrlInput
        style={styles.input}
        navigation={navigation}
        onChangeText={setRealmInputValue}
        value={realmInputValue}
        onSubmitEditing={handleInputSubmit}
        enablesReturnKeyAutomatically
      />
      {error !== null ? (
        <ErrorMsg error={error} />
      ) : (
        <ZulipTextIntl text="e.g. zulip.example.com" style={styles.hintText} />
      )}
      <ZulipButton
        style={styles.button}
        text="Enter"
        progress={progress}
        onPress={handleInputSubmit}
        disabled={urlFromInputValue(realmInputValue) === undefined}
      />
      {clipboardHasURL === true && (
        // Recognize when the user has copied a URL, and let them use it
        // without making them enter it into the input.
        //
        // TODO(?): Instead, use a FAB that persists while
        //   clipboardHasURL !== true && !progress
        <ZulipButton
          style={styles.button}
          text="Use copied URL"
          progress={progress}
          onPress={tryCopiedUrl}
        />
      )}
    </Screen>
  );
}
