/* @flow strict-local */
import messages from '../i18n/messages';

export type Language = {|
  tag: $Keys<typeof messages>,
  name: string,
  nativeName: string,
|};

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
  // When adding a language here, remember to add the language's name
  // (in English) to messages_en.json, too, so it can be translated.
  { tag: 'en', name: 'English', nativeName: 'English' },
  { tag: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { tag: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { tag: 'ca', name: 'Catalan', nativeName: 'Català' },
  { tag: 'zh-Hans', name: 'Chinese (Simplified)', nativeName: '中文（简体）' },
  { tag: 'zh-Hant', name: 'Chinese (Traditional)', nativeName: '中文 (繁体)' },
  { tag: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { tag: 'da', name: 'Danish', nativeName: 'Dansk' },
  { tag: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  // TODO: add `en_GB` -- it's "100% translated", though that just means
  //   the one string mentioning "organization" has s/z/s/ in that word
  { tag: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { tag: 'fr', name: 'French', nativeName: 'Français' },
  { tag: 'gl', name: 'Galician', nativeName: 'Galego' },
  { tag: 'de', name: 'German', nativeName: 'Deutsch' },
  { tag: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { tag: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { tag: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { tag: 'it', name: 'Italian', nativeName: 'Italiano' },
  { tag: 'ja', name: 'Japanese', nativeName: '日本語' },
  { tag: 'ko', name: 'Korean', nativeName: '한국어' },
  { tag: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { tag: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { tag: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { tag: 'pl', name: 'Polish', nativeName: 'Polski' },
  { tag: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { tag: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)' },
  { tag: 'ro', name: 'Romanian', nativeName: 'Română' },
  { tag: 'ru', name: 'Russian', nativeName: 'Русский' },
  { tag: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { tag: 'es', name: 'Spanish', nativeName: 'Español' },
  { tag: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { tag: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { tag: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { tag: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { tag: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

export default languages;
