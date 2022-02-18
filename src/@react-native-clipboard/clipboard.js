/**
 * Helpers for @react-native-clipboard/clipboard
 *
 * @flow strict-local
 */

import { useState, useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import * as logging from '../utils/logging';
import { tryParseUrl } from '../utils/url';

/**
 * A Hook for the current value of Clipboard.hasURL, when known.
 *
 * https://github.com/react-native-clipboard/clipboard#hasurl
 *
 * With a hack to simulate Clipboard.hasURL on iOS <14, and on Android.
 *
 * Returns the payload of the most recently settled Clipboard.hasURL()
 * Promise; otherwise `null` if that Promise rejected, or if no such Promise
 * has settled.
 *
 * Re-queries when clipboard value changes, and when app state changes to
 * "active".
 *
 * Subject to subtle races. Don't use for anything critical, and do a
 * sanity-check in clipboard reads informed by the result of this (e.g.,
 * check the retrieved string with `tryParseUrl`).
 */
export function useClipboardHasURL(): boolean | null {
  const [result, setResult] = useState<boolean | null>(null);

  const getAndSetResult = useCallback(async () => {
    try {
      // TODO(ios-14): Simplify conditional and jsdoc.
      if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 14) {
        setResult(await Clipboard.hasURL());
      } else {
        // Hack: Simulate Clipboard.hasURL
        setResult(!!tryParseUrl(await Clipboard.getString()));
      }
    } catch (e) {
      logging.error(e);
      setResult(null);
    }
  }, []);

  useEffect(() => {
    getAndSetResult();

    const clipboardListener = Clipboard.addListener(() => {
      getAndSetResult();
    });

    const appStateChangeListener = AppState.addEventListener('change', s => {
      if (s === 'active') {
        getAndSetResult();
      }
    });

    return () => {
      clipboardListener.remove();
      AppState.removeEventListener('change', appStateChangeListener);
    };
  }, [getAndSetResult]);

  return result;
}

// We probably don't want a useClipboardHasWebURL. The implementation of
// Clipboard.hasWebURL on iOS is such that it matches when the copied string
// *has* a URL, not when it *is* a URL.
