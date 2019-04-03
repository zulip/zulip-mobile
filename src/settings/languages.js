/* @flow strict */
/* eslint-disable spellcheck/spell-checker */

export type Language = {
  locale: string,
  name: string,
  nativeName: string,
};

const languages: $ReadOnlyArray<Language> = [
  {
    locale: 'en',
    name: 'English',
    nativeName: 'English',
  },
  {
    locale: 'bg',
    name: 'Bulgarian',
    nativeName: 'Български',
  },
  {
    locale: 'ca',
    name: 'Catalan',
    nativeName: 'Català',
  },
  {
    locale: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '中文 (简体)',
  },
  {
    locale: 'cs',
    name: 'Czech',
    nativeName: 'Čeština',
  },
  {
    locale: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
  },
  {
    locale: 'fr',
    name: 'French',
    nativeName: 'Français',
  },
  {
    locale: 'de',
    name: 'German',
    nativeName: 'Deutsch',
  },
  {
    locale: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
  },
  {
    locale: 'hu',
    name: 'Hungarian',
    nativeName: 'Magyar',
  },
  {
    locale: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
  },
  {
    locale: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
  },
  {
    locale: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
  },
  {
    locale: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
  },
  {
    locale: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
  },
  {
    locale: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
  },
  {
    locale: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
  },
  {
    locale: 'sr',
    name: 'Serbian',
    nativeName: 'Српски',
  },
  {
    locale: 'es',
    name: 'Spanish',
    nativeName: 'Español',
  },
  {
    locale: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
  },
  {
    locale: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
  },
];

export default languages;
