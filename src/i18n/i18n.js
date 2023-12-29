/* @flow strict-local */
import type { LocalizableText } from '../types';

/**
 * A LocalizableText that always resolves to the given string.
 *
 * Useful for wrapping user data, like the name of a user or a stream,
 * in a context where we sometimes also show a string that needs translation.
 */
export function noTranslation(value: string): LocalizableText {
  return { text: '{_}', values: { _: value } };
}
