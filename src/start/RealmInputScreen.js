/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';
import { Keyboard, View, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { ServerSettings } from '../api/settings/getServerSettings';
import ZulipTextIntl from '../common/ZulipTextIntl';
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';
import { tryParseUrl } from '../utils/url';
import * as api from '../api';
import { ThemeContext } from '../styles/theme';
import { createStyleSheet, HALF_COLOR } from '../styles';
import { showErrorAlert } from '../utils/info';
import { TranslationContext } from '../boot/TranslationProvider';
import type { LocalizableText } from '../types';
import { BRAND_COLOR } from '../styles/constants';
import ZulipText from '../common/ZulipText';
import WebLink from '../common/WebLink';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'realm-input'>,
  route: RouteProp<'realm-input', {| initial: boolean | void |}>,
|}>;

enum ValidationError {
  Empty = 0,
  InvalidUrl = 1,
  NoUseEmail = 2,
  UnsupportedSchemeZulip = 3,
  UnsupportedSchemeOther = 4,
}

function validationErrorMsg(validationError: ValidationError): LocalizableText {
  switch (validationError) {
    case ValidationError.Empty:
      return 'Please enter a URL.';
    case ValidationError.InvalidUrl:
      return 'Please enter a valid URL.';
    case ValidationError.NoUseEmail:
      return 'Please enter the server URL, not your email.';
    case ValidationError.UnsupportedSchemeZulip:
    // TODO: What would be more helpful here? (First, maybe find out what
    //   leads people to try a "zulip://" URL, if anyone actually does that)
    case ValidationError.UnsupportedSchemeOther: // eslint-disable-line no-fallthrough
      return 'Unsupported server URL scheme. Please use http: or https:.';
  }
}

type MaybeParsedInput =
  | {| +valid: true, value: URL |}
  | {| +valid: false, error: ValidationError |};

const tryParseInput = (realmInputValue: string): MaybeParsedInput => {
  const trimmedInputValue = realmInputValue.trim();

  if (trimmedInputValue.length === 0) {
    return { valid: false, error: ValidationError.Empty };
  }

  let url = tryParseUrl(trimmedInputValue);
  if (!/^https?:\/\//.test(trimmedInputValue)) {
    if (url && url.protocol === 'zulip:') {
      // Someone might get the idea to try one of the "zulip://" URLs that
      // are discussed sometimes.
      // TODO(?): Log to Sentry. How much does this happen, if at all? Maybe
      //   log once when the input enters this error state, but don't spam
      //   on every keystroke/render while it's in it.
      return { valid: false, error: ValidationError.UnsupportedSchemeZulip };
    } else if (url && url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { valid: false, error: ValidationError.UnsupportedSchemeOther };
    }
    url = tryParseUrl(`https://${trimmedInputValue}`);
  }

  if (!url) {
    return { valid: false, error: ValidationError.InvalidUrl };
  }
  if (url.username !== '') {
    return { valid: false, error: ValidationError.NoUseEmail };
  }

  return { valid: true, value: url };
};

type Suggestion =
  | ValidationError // Display relevant validation error message
  | string // Suggest this string as the server URL
  | null; // No suggestion

function getSuggestion(realmInputValue, maybeParsedInput): Suggestion {
  if (
    !maybeParsedInput.valid
    // Ignore other errors, like InvalidUrl, which often happen when the
    // user just hasn't finished typing a good URL. Those errors will still
    // show up if they apply at submit time; see the submit handler.
    && (maybeParsedInput.error === ValidationError.NoUseEmail
      || maybeParsedInput.error === ValidationError.UnsupportedSchemeZulip
      || maybeParsedInput.error === ValidationError.UnsupportedSchemeOther)
  ) {
    return maybeParsedInput.error;
  }

  const normalizedValue = realmInputValue.trim().replace(/^https?:\/\//, '');

  if (
    // This couldn't be a valid Zulip Cloud server subdomain. (Criteria
    // copied from check_subdomain_available in zerver/forms.py.)
    normalizedValue.length < 3
    || !/^[a-z0-9-]*$/.test(normalizedValue)
    || normalizedValue[0] === '-'
    || normalizedValue[normalizedValue.length - 1] === '-'
    // TODO(?): Catch strings hard-coded as off-limits, like "your-org".
    //   (See check_subdomain_available in zerver/forms.py.)
  ) {
    return null;
  }

  if ('chat'.startsWith(normalizedValue)) {
    return 'https://chat.zulip.org/';
  }

  return `https://${normalizedValue}.zulipchat.com/`;
}

export default function RealmInputScreen(props: Props): Node {
  const { navigation, route } = props;

  const _ = React.useContext(TranslationContext);
  const themeContext = React.useContext(ThemeContext);

  const [progress, setProgress] = React.useState(false);
  const [realmInputValue, setRealmInputValue] = React.useState('');
  const maybeParsedInput = tryParseInput(realmInputValue);

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
    if (!maybeParsedInput.valid) {
      showErrorAlert(_('Invalid input'), _(validationErrorMsg(maybeParsedInput.error)));
      return;
    }

    setProgress(true);
    try {
      const serverSettings: ServerSettings = await api.getServerSettings(maybeParsedInput.value);
      navigation.push('auth', { serverSettings });
      Keyboard.dismiss();
    } catch (errorIllTyped) {
      const err: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
      showErrorAlert(_('Cannot connect to server.'));
      /* eslint-disable no-console */
      console.warn('RealmInputScreen: failed to connect to server:', err);
      // $FlowFixMe[incompatible-cast]: assuming caught exception was Error
      console.warn((err: Error).stack);
    } finally {
      setProgress(false);
    }
  }, [navigation, maybeParsedInput, _]);

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
        hintText: { fontSize: 12, fontStyle: 'italic' },
        hintTextLink: {
          fontSize: 12,
          fontStyle: 'normal',
          color: BRAND_COLOR, // chosen to mimic WebLink
        },
        button: { marginTop: 8 },
      }),
    [themeContext],
  );

  const suggestion = getSuggestion(realmInputValue, maybeParsedInput);

  const shouldTryRealmOnNextRender = React.useRef(false);
  React.useEffect(() => {
    if (shouldTryRealmOnNextRender.current) {
      shouldTryRealmOnNextRender.current = false;
      tryRealm();
    }
  });

  const handlePressSuggestion = React.useCallback(suggestion_ => {
    shouldTryRealmOnNextRender.current = true;
    setRealmInputValue(suggestion_);
  }, []);

  const renderedSuggestion = React.useMemo(() => {
    if (suggestion === null) {
      return null;
    } else if (typeof suggestion === 'string') {
      return (
        <ZulipTextIntl
          style={styles.hintText}
          text={{
            text: 'Suggestion: <z-link>{suggestedServerUrl}</z-link>',
            values: {
              suggestedServerUrl: suggestion,
              'z-link': chunks => (
                <ZulipText
                  style={styles.hintTextLink}
                  onPress={() => handlePressSuggestion(suggestion)}
                >
                  {chunks}
                </ZulipText>
              ),
            },
          }}
        />
      );
    } else {
      return <ZulipTextIntl style={styles.hintText} text={validationErrorMsg(suggestion)} />;
    }
  }, [suggestion, handlePressSuggestion, styles]);

  return (
    <Screen
      title="Welcome"
      canGoBack={!route.params.initial}
      padding
      centerContent
      keyboardShouldPersistTaps="always"
      shouldShowLoadingBanner={false}
    >
      <ZulipTextIntl
        text={{
          text: 'Enter your Zulip server URL: <z-link>(What’s this?)</z-link>',
          values: {
            'z-link': chunks => (
              <WebLink url={new URL('https://zulip.com/help/logging-in#find-the-zulip-log-in-url')}>
                {chunks}
              </WebLink>
            ),
          },
        }}
      />
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
          onChangeText={setRealmInputValue}
          blurOnSubmit={false}
          keyboardType="url"
          underlineColorAndroid="transparent"
          onSubmitEditing={tryRealm}
          enablesReturnKeyAutomatically
          disableFullscreenUI
          ref={textInputRef}
        />
      </View>
      {renderedSuggestion}
      <ZulipButton
        style={styles.button}
        text="Enter"
        progress={progress}
        onPress={tryRealm}
        isPressHandledWhenDisabled
        disabled={!maybeParsedInput.valid}
      />
    </Screen>
  );
}
