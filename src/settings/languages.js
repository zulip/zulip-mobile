/* @flow strict-local */
/* eslint-disable spellcheck/spell-checker */

import translations from '../i18n/messages';
import { partition } from '../utils/misc';

export type Language = {
  locale: string,
  name: string,
  nativeName: string,
};

/**
 * The set of languages we offer in the language settings screen.
 *
 * The translation data files in `static/translations/` include all the
 * languages we have open on Transifex for people to translate.  This means
 * all the languages that someone's expressed interest in translating Zulip
 * into, and there are usually some that aren't yet much translated at all.
 *
 * To avoid offering users a translation into their language when it won't
 * actually do anything, we maintain this separate list of languages that
 * are translated to an adequate level.
 *
 * The Zulip webapp offers a language in the UI when it's over 5%
 * translated.  (Search for `percent_translated` in the server code.)
 * To see translation percentages, consult Transifex:
 *   https://www.transifex.com/zulip/zulip/mobile/
 *
 * For the values of `nativeName`, consult Wikipedia:
 *   https://meta.wikimedia.org/wiki/List_of_Wikipedias
 * or better yet, Wikipedia's own mobile UIs.  Wikipedia is a very
 * conscientiously international and intercultural project with a lot of
 * effort going into it by speakers of many languages, which makes it a
 * useful gold standard for this.
 */
const languages: $ReadOnlyArray<Language> = [
  { locale: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { locale: 'ca', name: 'Catalan', nativeName: 'Català' },
  { locale: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { locale: 'de', name: 'German', nativeName: 'Deutsch' },
  { locale: 'en', name: 'English', nativeName: 'English' },
  // TODO: add `en_GB` -- it's "100% translated", though that just means
  //   the one string mentioning "organization" has s/z/s/ in that word
  { locale: 'es', name: 'Spanish', nativeName: 'Español' },
  { locale: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { locale: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { locale: 'fr', name: 'French', nativeName: 'Français' },
  { locale: 'gl', name: 'Galician', nativeName: 'Galego' },
  { locale: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { locale: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { locale: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { locale: 'it', name: 'Italian', nativeName: 'Italiano' },
  { locale: 'ja', name: 'Japanese', nativeName: '日本語' },
  { locale: 'ko', name: 'Korean', nativeName: '한국어' },
  { locale: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { locale: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { locale: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { locale: 'pl', name: 'Polish', nativeName: 'Polski' },
  { locale: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { locale: 'ro', name: 'Romanian', nativeName: 'Română' },
  { locale: 'ru', name: 'Russian', nativeName: 'Русский' },
  { locale: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { locale: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { locale: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { locale: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { locale: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { locale: 'zh-Hans', name: 'Chinese (Simplified)', nativeName: '中文 (简体)' },
  { locale: 'zh-Hant', name: 'Chinese (Traditional)', nativeName: '中文 (繁体)' },
];

const sortForDisplay = (arr: $ReadOnlyArray<Language>): $ReadOnlyArray<Language> =>
  [...arr].sort((a, b) =>
    a.locale === 'en' ? -1 : b.locale === 'en' ? +1 : a.name < b.name ? -1 : +1,
  );

const [knownLanguages, unknownLanguages] = partition<Language>(
  languages,
  ({ locale }) => locale in translations,
);

/* Red-box and shows in the debugger at import time. */
if (unknownLanguages.length !== 0) {
  // eslint-disable-next-line no-console
  console.error(
    'Unknown locales in language-selection screen:\n   ',
    JSON.stringify(unknownLanguages),
  );
}

export default sortForDisplay(knownLanguages);
