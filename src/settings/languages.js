/* @flow strict-local */
import messages from '../i18n/messages';

export type Language = {|
  tag: $Keys<typeof messages>,
  name: string,
  selfname: string,
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
 * For the values of `selfname`, consult Wikipedia:
 *   https://meta.wikimedia.org/wiki/List_of_Wikipedias
 * or better yet, Wikipedia's own mobile UIs.  Wikipedia is a very
 * conscientiously international and intercultural project with a lot of
 * effort going into it by speakers of many languages, which makes it a
 * useful gold standard for this.
 */
const languages: $ReadOnlyArray<Language> = [
  // When adding a language here, remember to add the language's name
  // (in English) to messages_en.json, too, so it can be translated.
  { tag: 'en', name: 'English', selfname: 'English' },
  { tag: 'ar', name: 'Arabic', selfname: 'العربية' },
  { tag: 'bg', name: 'Bulgarian', selfname: 'Български' },
  { tag: 'ca', name: 'Catalan', selfname: 'Català' },
  { tag: 'zh-Hans', name: 'Chinese (Simplified)', selfname: '中文（简体）' },
  { tag: 'zh-Hant', name: 'Chinese (Traditional)', selfname: '中文 (繁体)' },
  { tag: 'cs', name: 'Czech', selfname: 'Čeština' },
  { tag: 'da', name: 'Danish', selfname: 'Dansk' },
  { tag: 'nl', name: 'Dutch', selfname: 'Nederlands' },
  { tag: 'en-GB', name: 'English (U.K.)', selfname: 'English (U.K.)' },
  { tag: 'fi', name: 'Finnish', selfname: 'Suomi' },
  { tag: 'fr', name: 'French', selfname: 'Français' },
  { tag: 'gl', name: 'Galician', selfname: 'Galego' },
  { tag: 'de', name: 'German', selfname: 'Deutsch' },
  { tag: 'hi', name: 'Hindi', selfname: 'हिन्दी' },
  { tag: 'hu', name: 'Hungarian', selfname: 'Magyar' },
  { tag: 'id', name: 'Indonesian', selfname: 'Bahasa Indonesia' },
  { tag: 'it', name: 'Italian', selfname: 'Italiano' },
  { tag: 'ja', name: 'Japanese', selfname: '日本語' },
  { tag: 'ko', name: 'Korean', selfname: '한국어' },
  { tag: 'lt', name: 'Lithuanian', selfname: 'Lietuvių' },
  { tag: 'ml', name: 'Malayalam', selfname: 'മലയാളം' },
  { tag: 'fa', name: 'Persian', selfname: 'فارسی' },
  { tag: 'pl', name: 'Polish', selfname: 'Polski' },
  { tag: 'pt', name: 'Portuguese', selfname: 'Português' },
  { tag: 'pt-PT', name: 'Portuguese (Portugal)', selfname: 'Português (Portugal)' },
  { tag: 'ro', name: 'Romanian', selfname: 'Română' },
  { tag: 'ru', name: 'Russian', selfname: 'Русский' },
  { tag: 'sr', name: 'Serbian', selfname: 'Српски' },
  { tag: 'es', name: 'Spanish', selfname: 'Español' },
  { tag: 'sv', name: 'Swedish', selfname: 'Svenska' },
  { tag: 'ta', name: 'Tamil', selfname: 'தமிழ்' },
  { tag: 'tr', name: 'Turkish', selfname: 'Türkçe' },
  { tag: 'uk', name: 'Ukrainian', selfname: 'Українська' },
  { tag: 'vi', name: 'Vietnamese', selfname: 'Tiếng Việt' },
];

export default languages;
