#!/usr/bin/env node
// @flow

/* This script is run by Node directly, not via Babel; we can't use Flow
   annotations inline (at least, not without jumping through additional hoops).

   We can, however, use Flow's comment-annotation syntax [0]. So we do.

   [0] https://flow.org/en/docs/types/comments/
*/

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const util = require('util');
const js_yaml = require('js-yaml');

// fs.promises.foobar, from Node v12 onward. (The snap-provided Node v10 emits
// an unhelpful warning message if `fs.promises` is actually used.)
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

/**
 * Given a sequence of strings, return a possibly-shorter list of unique strings in
 * that list.
 */
const uniq /* : (Iterable<string>) => Array<string> */ = arr => {
  const set = {};
  const out = [];
  for (const val of arr) {
    if (!set[val]) {
      out.push(val);
    }
    set[val] = true;
  }
  return out;
};

/* :: type EntriesType = <K: string, V>({ +[K]: V }) => $ReadOnlyArray<[K, V]>; */
/** Object.entries(), only with a better Flow type. */
const objectEntries /* : EntriesType */ = (Object.entries /* : $FlowFixMe */);

(async () => {
  /** The project root. */
  const root = path.resolve(__dirname, '..');
  /** The human-readable name of this script. */
  const thisScript = path.relative(root, __filename).replace(/^\.\//, '');
  /** The path where our translation data is stored. */
  const translationsPath = path.join(root, '/static/translations');

  const configFileName = 'languages.yaml';
  const configFilePath = path.join(translationsPath, configFileName);

  // ===================================================================
  // Data acquisition
  // ===================================================================

  /* ::
    type LanguagesYamlFile = {
      languages_used: { +[string]: {| english: string, native: string |} },
      ...
    };
  */

  /** Our config file. Contains all our hand-maintained lists. */
  const languagesConfig /* : LanguagesYamlFile */ = js_yaml.safeLoad(
    await readFile(configFilePath, 'utf8'),
  );

  /**
   * A mapping from Transifex language-names to human names, containing every
   * language which we think we'll need.
   */
  const knownLanguages = languagesConfig.languages_used;

  /** English-language translation data. Used as a reference. */
  const englishData /* : { +[string]: string } */ = JSON.parse(
    await readFile(path.join(translationsPath, 'messages_en.json')),
  );

  /**
   * All the locales for which we have translation databases, mapped to the
   * approximate completeness of each database (as a number from 0 to 1).
   *
   * (Languages which borrow many technical or internet-social terms from
   * English may appear to have a lower translation score than they actually
   * do. This is not expected to significantly affect later heuristics.)
   */
  const rawLocales /* : { +[string]: number } */ = await (async () => {
    const translationsDir /* : Array<string> */ = await readdir(translationsPath);
    const rx = /messages_(.*)\.json$/;
    const ret /* : { [string]: number } */ = {};

    for (const filename of translationsDir) {
      const match = rx.exec(filename);
      if (!match) {
        continue;
      }

      const transifexCode = match[1];
      // special case: by definition, always 100% translated
      if (transifexCode === 'en') {
        ret[transifexCode] = 1;
        continue;
      }

      const languageData = JSON.parse(await readFile(path.join(translationsPath, filename)));
      const [translated_lines, all_lines] = objectEntries(languageData).reduce(
        ([translated, all], [src, tx]) => [translated + (englishData[src] !== tx), all + 1],
        [0, 0],
      );
      if (all_lines === 0) {
        console.warn(`${filename} is completely empty`);
      }

      ret[transifexCode] = translated_lines / all_lines;
    }
    return Object.freeze(ret);
  })();

  // console.log({ rawLocales });

  // Example value for `Object.keys(rawLocales)`:
  //
  // [ ar, bg, ca, cs, da, de, el, el_GR, en, en_GB, es, fa, fi, fr, gl, hi, hr,
  //   hu, id_ID, it, ja, ko, lt, ml, nb_NO, nl, pl, pt, ro, ru, sr, sv, ta, tr,
  //   uk, uz, vi, zh-Hans, zh-Hant, zh_TW ]
  //
  // All locales start with a two- (or, potentially, three-) character code from
  // ISO 639, and this can be relied on. After that, it gets tricky; other
  // potentially relevant standards include -- but are in no way limited to --
  // ISO 3166, ISO/IEC 15897, ISO 15924, UN M.49, RFC 1766, RFC 3066, RFC 4646,
  // RFC 4647, RFC 5646, IETF BCP 47, and XKCD 927.
  //
  // Fortunately, this script makes no pretense to being compliant with any of
  // the above standards. We simply map Transifex-provided locale-names to
  // React-Intl-expected locale-names.

  // ===================================================================
  // Data validation
  // ===================================================================

  // Confirm that `rawLocales` and `knownLanguages` are consonant with each
  // other.
  {
    let abort = false;

    // Confirm that rawLocales is a (fuzzy) subset of knownLanguages.
    for (const [lang, completeness] of objectEntries(rawLocales)) {
      if (lang in knownLanguages) {
        /* It would be nice, from some perspective, to make the set of supported
           languages exactly the set of languages which are "complete enough".

           However, `isCompleteEnough` is not monotonic; it may fluctuate from
           release to release -- not only upwards, as new translated strings are
           included, but also downwards as new untranslated English strings are
           added. While adding new languages is fine and has few negative
           effects, *removing* a language is less so, even with a migration to
           move its users to a valid locale.

           We could warn here, if there were any languages that we included that
           aren't sufficiently translated (and at time of writing, there are
           several)... but what could the reader of that warning do? */
      } else {
        /* On the other hand, if a language has been translated enough that we
           probably do want to use it, stop processing and alert the maintainer,
           so that they can add it. */

        // eslint-disable-next-line no-lonely-if
        if (completeness >= 0.2) {
          console.error(`error: ${lang} (unknown) is above 20% completeness, but is not used`);
          abort = true;
        }
      }
    }

    // Confirm that knownLanguages is a (true) subset of rawLocales.
    for (const [lang, { english }] of objectEntries(knownLanguages)) {
      if (!(lang in rawLocales)) {
        console.error(
          `error: ${lang} (${english}) is in ${configFileName}, but has no Transifex database`,
        );
        abort = true;
      }
    }

    if (abort) {
      return;
    }
  }

  // ===================================================================
  // Data transformation
  // ===================================================================

  /** Function from Transifex names to React-Intl names. */
  const toReactIntlName /* : (string) => string */ = (value /* : string */) => {
    // common case: simple two- or three-letter code
    if (/^[a-z]{2,3}$/.test(value)) {
      return value;
    }

    // simple POSIX-y case: two- or three-letter code with underscore and
    // capitalized territory code
    if (/^[a-z]{2,3}_[A-Z]{2}$/.test(value)) {
      return value.replace('_', '-'); // use hyphen instead
    }

    // simple BCP 47-ish case: two- or three-letter code with single
    // two-to-eight-letter subtag
    if (/^[a-z]{2,3}-[A-Za-z]{2,8}$/.test(value)) {
      return value;
    }

    // If anything else pops up, a human will have to figure out what to do and
    // encode it here.
    throw new Error(`${thisScript}: could not parse Transifex locale name '${value}'`);
  };

  /** Function from Transifex names to arbitrary JavaScript identifiers. */
  const toJsIdentifier /* : (string) => string */ = value =>
    /* BUG: this could cause identifiers collision */
    value.replace(/-/g, '_');

  /**
   * Function from Transifex names to React-Intl locale data group names
   * (approximately: ISO 639 codes).
   */
  const toLocaleGroup /* : (string) => string */ = value => {
    const m = value.match(/^([a-z]+)/);
    if (m === null) {
      throw new Error(`could not extract locale-group code from locale ${value}`);
    }
    return m[1];
  };

  // ===================================================================
  // Data collation
  // ===================================================================

  /* ::
    /// Various names for each locale.
    type NameSet = {|
      /// The Transifex name. Unique.
      transifex: string,

      /// The React-Intl name. Hopefully unique.
      react_intl: string,

      /// A local (module-internal) JavaScript identifier. Unique.
      js: string,

      /// The English name of the language. Presumably unique.
      english: string,

      /// The name of the language in the language itself. Presumably unique.
      native: string,

      /// The locale group. Not necessarily unique.
      group: string,
    |};
  */

  const allLocaleData /* : $ReadOnlyArray<NameSet> */ = objectEntries(knownLanguages).map(
    ([locale, names]) => ({
      transifex: locale,
      react_intl: toReactIntlName(locale),
      js: toJsIdentifier(locale),
      english: names.english,
      native: names.native,
      group: toLocaleGroup(locale),
    }),
  );

  const allLocaleGroups /* : string[] */ = uniq(allLocaleData.map(i => i.group));

  const autogenerationWarning = `\
/* This file was autogenerated by ${thisScript} from
   ${path.relative(root, configFilePath)}. Do not edit it directly. */`;

  // ===================================================================
  // Text: src/i18n/language_list.js
  // ===================================================================
  const language_list_js = `\
/* @flow strict-local */
/* eslint-disable spellcheck/spell-checker */

${autogenerationWarning}

export type Language = {
  /** The locale, as named by react-intl. Not for display. */
  locale: string,
  /** The language's name in English. Transifex-translatable. */
  name: string,
  /** The language's name in the language itself. For raw display. */
  nativeName: string,
};

export const languageData: $ReadOnlyArray<Language> = [
${allLocaleData
  .map(
    g =>
      `  { ${[['locale', g.react_intl], ['name', g.english], ['nativeName', g.native]]
        .map(([key, value]) => `${key}: '${value}'`)
        .join(', ')} },`,
  )
  .join('\n')}
];
`;

  // ===================================================================
  // Text: src/i18n/locale.js
  // ===================================================================

  const locale_js = `\
/* @flow strict-local */
/* eslint-disable spellcheck/spell-checker */

${autogenerationWarning}

import { addLocaleData } from 'react-intl';
${allLocaleGroups.map(g => `import ${g} from 'react-intl/locale-data/${g}';`).join('\n')}

[
${allLocaleGroups.map(g => `  ${g},`).join('\n')}
].forEach(locale => addLocaleData(locale));
`;

  // ===================================================================
  // Text: src/i18n/messages.js
  // ===================================================================
  const messages_js = `\
/* @flow strict-local */
/* eslint-disable spellcheck/spell-checker */

${autogenerationWarning}

${allLocaleData
  .map(
    ({ js, transifex: tfx }) =>
      `import ${js} from '../../static/translations/messages_${tfx}.json';`,
  )
  .join('\n')}

export default {
${allLocaleData
  .map(({ react_intl: rintl, js }) => `  ${rintl === js ? js : `'${rintl}': ${js}`},`)
  .join('\n')}
};
`;

  // ===================================================================
  // Text: flow-typed/translations.js
  // ===================================================================
  const importMessages = c => `\
declare module '../../static/translations/messages_${c}.json' {
  declare export default {| [string]: string |};
}`;

  const translations_js = `\
${autogenerationWarning}

${allLocaleData.map(({ transifex }) => importMessages(transifex)).join('\n\n')}
`;

  // ===================================================================
  // Output
  // ===================================================================

  await writeFile('src/i18n/language_list.js', language_list_js);
  await writeFile('src/i18n/locale.js', locale_js);
  await writeFile('src/i18n/messages.js', messages_js);
  await writeFile('flow-typed/translations.js', translations_js);
})().catch(console.error);
