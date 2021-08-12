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
  // Keep these sorted by selfname.
  //
  // When adding a language here, remember to add the language's name
  // (in English) to messages_en.json, too, so it can be translated.
  { tag: 'id', name: 'Indonesian', selfname: 'Bahasa Indonesia' },
  { tag: 'ca', name: 'Catalan', selfname: 'Català' },
  { tag: 'cs', name: 'Czech', selfname: 'Čeština' },
  { tag: 'da', name: 'Danish', selfname: 'Dansk' },
  { tag: 'de', name: 'German', selfname: 'Deutsch' },
  { tag: 'en', name: 'English', selfname: 'English' },
  { tag: 'en-GB', name: 'English (U.K.)', selfname: 'English (U.K.)' },
  { tag: 'es', name: 'Spanish', selfname: 'Español' },
  { tag: 'fr', name: 'French', selfname: 'Français' },
  { tag: 'gl', name: 'Galician', selfname: 'Galego' },
  { tag: 'it', name: 'Italian', selfname: 'Italiano' },
  { tag: 'lt', name: 'Lithuanian', selfname: 'Lietuvių' },
  { tag: 'hu', name: 'Hungarian', selfname: 'Magyar' },
  { tag: 'nl', name: 'Dutch', selfname: 'Nederlands' },
  { tag: 'pl', name: 'Polish', selfname: 'Polski' },
  // `pt-BR` omitted; it's over the threshold but fragmentary compared to
  // plain `pt`, which is meant to be the same thing.  See discussion:
  //   https://github.com/zulip/zulip-mobile/pull/4901#discussion_r673472275
  //   https://chat.zulip.org/#narrow/stream/58-translation/topic/language.20cleanup
  { tag: 'pt', name: 'Portuguese', selfname: 'Português' },
  { tag: 'pt-PT', name: 'Portuguese (Portugal)', selfname: 'Português (Portugal)' },
  { tag: 'ro', name: 'Romanian', selfname: 'Română' },
  { tag: 'fi', name: 'Finnish', selfname: 'Suomi' },
  { tag: 'sv', name: 'Swedish', selfname: 'Svenska' },
  { tag: 'vi', name: 'Vietnamese', selfname: 'Tiếng Việt' },
  { tag: 'tr', name: 'Turkish', selfname: 'Türkçe' },
  { tag: 'bg', name: 'Bulgarian', selfname: 'Български' },
  { tag: 'ru', name: 'Russian', selfname: 'Русский' },
  { tag: 'sr', name: 'Serbian', selfname: 'Српски' },
  { tag: 'uk', name: 'Ukrainian', selfname: 'Українська' },
  { tag: 'ar', name: 'Arabic', selfname: 'العربية' },
  { tag: 'fa', name: 'Persian', selfname: 'فارسی' },
  { tag: 'hi', name: 'Hindi', selfname: 'हिन्दी' },
  { tag: 'ta', name: 'Tamil', selfname: 'தமிழ்' },
  { tag: 'ml', name: 'Malayalam', selfname: 'മലയാളം' },
  { tag: 'ko', name: 'Korean', selfname: '한국어' },
  { tag: 'zh-Hans', name: 'Chinese (Simplified)', selfname: '中文（简体）' },
  { tag: 'zh-Hant', name: 'Chinese (Traditional)', selfname: '中文 (繁体)' },
  { tag: 'ja', name: 'Japanese', selfname: '日本語' },
];

export default languages;
