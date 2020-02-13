#!/usr/bin/env node
// @flow

/* This script is run by Node directly, not via Babel; we can't use Flow
   annotations inline (at least, not without jumping through additional hoops).

   We can, however, use Flow's comment-annotation syntax [0]. So we do.

   [0] https://flow.org/en/docs/types/comments/
*/

const fs = require('fs');
const path = require('path');
const util = require('util');

// fs.promises.foobar, from Node v12 onward. (The snap-provided Node v10 emits
// an unhelpful warning message if `fs.promises` is actually used.)
const readdir = util.promisify(fs.readdir);
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

(async () => {
  /** The project root. */
  const root = path.resolve(__dirname, '..');
  /** The human-readable name of this script. */
  const thisScript = path.relative(root, __filename).replace(/^\.\//, '');

  // ===================================================================
  // Data acquisition
  // ===================================================================

  /** All the locales for which we have translation databases. */
  const rawLocales /* : string[] */ = await (async () => {
    const translationsDir /* : Array<string> */ = await readdir(
      path.join(root, '/static/translations'),
    );
    const rx = /messages_(.*)\.json$/;
    const ret = [];

    for (const name of translationsDir) {
      const match = rx.exec(name);
      if (!match) {
        continue;
      }
      ret.push(match[1]);
    }
    return ret.sort();
  })();

  // Example value for `rawLocales`:
  //
  // [ ar, bg, ca, cs, da, de, el, el_GR, en, en_GB, es, fa, fi, fr, gl, hi, hr,
  //   hu, id_ID, it, ja, ko, lt, ml, nb_NO, nl, pl, pt, ro, ru, sr, sv, ta, tr,
  //   uk, uz, vi, zh-Hans, zh-Hant, zh_TW ]

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

      /// The locale group. Not necessarily unique.
      group: string,
    |};
  */

  /**  */
  const allLocaleData /* : $ReadOnlyArray<NameSet> */ = rawLocales.map(locale => ({
    transifex: locale,
    react_intl: toReactIntlName(locale),
    js: toJsIdentifier(locale),
    group: toLocaleGroup(locale),
  }));

  const allLocaleGroups /* : string[] */ = uniq(allLocaleData.map(i => i.group));

  const autogenerationWarning = `\
/* This file was autogenerated by ${thisScript}.
   Do not edit. */`;

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

  await writeFile('src/i18n/locale.js', locale_js);
  await writeFile('src/i18n/messages.js', messages_js);
  await writeFile('flow-typed/translations.js', translations_js);
})();
