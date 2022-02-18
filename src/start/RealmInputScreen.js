/* @flow strict-local */
import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { Keyboard } from 'react-native';

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
  const [progress, setProgress] = useState<boolean>(false);
  const [realmInputValue, setRealmInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const tryRealm = useCallback(async () => {
    const parsedRealm = urlFromInputValue(realmInputValue);
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
  }, [realmInputValue]);

  const handleRealmChange = useCallback(value => {
    setRealmInputValue(value);
  }, []);

  const { navigation } = props;

  const styles = {
    input: { marginTop: 16, marginBottom: 8 },
    hintText: { paddingLeft: 2, fontSize: 12 },
    button: { marginTop: 8 },
  };

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
        onChangeText={handleRealmChange}
        onSubmitEditing={tryRealm}
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
        onPress={tryRealm}
        disabled={urlFromInputValue(realmInputValue) === undefined}
      />
    </Screen>
  );
}
