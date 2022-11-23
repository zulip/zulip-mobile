/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';
import { Keyboard, View, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import ErrorMsg from '../common/ErrorMsg';
import ZulipTextIntl from '../common/ZulipTextIntl';
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';
import { tryParseUrl } from '../utils/url';
import * as api from '../api';
import { ThemeContext } from '../styles/theme';
import { createStyleSheet, HALF_COLOR } from '../styles';

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
  const { navigation, route } = props;

  const themeContext = React.useContext(ThemeContext);

  const [progress, setProgress] = React.useState(false);
  const [realmInputValue, setRealmInputValue] = React.useState('');
  const [error, setError] = React.useState(null);

  const textInputRef = React.useRef<React$ElementRef<typeof TextInput> | null>(null);

  // When the route is focused in the navigation, focus the input.
  // Otherwise, if you go back to this screen from the auth screen, the
  // input won't be focused.
  useFocusEffect(
    useCallback(() => {
      if (textInputRef.current) {
        // Sometimes the effect of this `.focus()` is immediately undone
        // (the keyboard is closed) by a Keyboard.dismiss() from React
        // Navigation's internals. Seems like a complex bug, but the symptom
        // isn't terrible, it just means that on back-navigating to this
        // screen, sometimes the keyboard flicks open then closed, instead
        // of just opening. Shrug. See
        //   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/realm-input/near/1346690
        textInputRef.current.focus();
      }
    }, []),
  );

  const tryRealm = React.useCallback(async () => {
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
      navigation.push('auth', { serverSettings });
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
  }, [navigation, realmInputValue]);

  const handleRealmChange = useCallback(value => {
    setRealmInputValue(value);
  }, []);

  const styles = React.useMemo(
    () =>
      createStyleSheet({
        inputWrapper: {
          flexDirection: 'row',
          opacity: 0.8,
          marginTop: 16,
          marginBottom: 8,
        },
        input: {
          flex: 1,
          padding: 0,
          fontSize: 20,
          color: themeContext.color,
        },
        hintText: { paddingLeft: 2, fontSize: 12 },
        button: { marginTop: 8 },
      }),
    [themeContext],
  );

  return (
    <Screen
      title="Welcome"
      canGoBack={!route.params.initial}
      padding
      centerContent
      keyboardShouldPersistTaps="always"
      shouldShowLoadingBanner={false}
    >
      <ZulipTextIntl text="Enter your Zulip server URL:" />
      <View style={styles.inputWrapper}>
        <TextInput
          value={realmInputValue}
          placeholder="your-org.zulipchat.com"
          placeholderTextColor={HALF_COLOR}
          style={styles.input}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="go"
          onChangeText={handleRealmChange}
          blurOnSubmit={false}
          keyboardType="url"
          underlineColorAndroid="transparent"
          onSubmitEditing={tryRealm}
          enablesReturnKeyAutomatically
          ref={textInputRef}
        />
      </View>
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
