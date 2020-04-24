/* @flow strict-local */
/* eslint-disable spellcheck/spell-checker */

import { type Language, languageData } from '../i18n/language_list';

export type { Language } from '../i18n/language_list';

const sortForDisplay = (arr: $ReadOnlyArray<Language>): $ReadOnlyArray<Language> =>
  [...arr].sort((a, b) =>
    a.locale === 'en' ? -1 : b.locale === 'en' ? +1 : a.name < b.name ? -1 : +1,
  );

export default sortForDisplay(languageData);
