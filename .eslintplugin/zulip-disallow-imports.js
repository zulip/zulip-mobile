/* @flow strict-local */

// This is an almost complete rewrite of ESLint's `no-restricted-imports` rule.
//
// At present, this is not a full replacement for all uses of that rule:
// `no-restricted-imports` allows blacklisting patterns of identifiers as well.
// This has not been reimplemented, but the facilities used by the original to
// do so have been left in place, in expectation of future requirements.
//
// The original is available at:
//
//   github.com/eslint/eslint/blob/0243549db4/lib/rules/no-restricted-imports.js

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

// $FlowFixMe: `ignore` has no flow-typed typedef file
const ignore = require('ignore');

// from node.js; Flow provides these types in core
const path = require('path');

/**
 * Trivial wrapper around `ignore` library. Partly this is for type-checking,
 * but mostly it's because "ignores" is a terrible way to spell "matches".
 */
class Matcher {
  /*:: _ignore; */
  constructor(items /*: $ReadOnlyArray<string>*/) {
    this._ignore = ignore().add(items);
  }
  matches(s /*: string*/) /*: boolean*/ {
    return this._ignore.ignores(s);
  }
}

/* ::

/**
 * Type of the options we receive from the .eslintrc file.
 *
 * The .eslintrc file may specify any number of these rules; each is considered
 * independently, and may forbid an import independently of the others.
 *-/
type OptionsRecord = $ReadOnly<{|
  /**
   * patterns: A .gitignore-style pattern set describing the set of restricted
   *   files. These files cannot be imported, unless the import is explicitly
   *   allowed by another rule in this options-set, *and* not explicitly
   *   disallowed by any.
   *-/
  patterns: $ReadOnlyArray<string>,

  /**
   * importerWhitelist: A .gitignore-style pattern set describing the set of
   *   files which may import from a restricted file.
   *
   * If this option is specified, it is total: no other files may perform
   *   an import. If omitted, it has no effect.
   *
   * This can be used as a blacklist by explicitly allowing all files, then
   *   revoking permissions on certain files with !-prefixed rules. See the
   *   Git documentation on .gitignore [0] for details.
   *
   * [0] https://git-scm.com/docs/gitignore#_pattern_format
   *-/
  importerWhitelist?: $ReadOnlyArray<string>,

  // Regexes. Not yet implemented.
  identifierWhitelist?: $ReadOnlyArray<string>,
  identifierBlacklist?: $ReadOnlyArray<string>,

  // Just a human-readable string.
  message?: string,
|}>;

/**
 * Type of a check function.
 *
 * A check function's responsibility is to report, as a side effect, whether a
 * given import is legal. The parameters are based on those provided by the
 * original scaffolding taken from ESLint's `no-restricted-imports` rule.
 *
 * The current filename (that is, the filename of the _importing_ file) is not
 * currently provided as a parameter; instead it's assumed to be available in
 * the local environment.
 *
 * @param {importedFile} The file being imported from.
 * @param {importedIdsMap} A map containing all imported identifiers, or '*' if
 *   that was imported.
 * @param {node} The AST node of the import statement being checked.
 *-/
type CheckFunction = (
  importedFile: string,
  importedIdsMap: Map<string, mixed[]>,
  node: $FlowFixMe,
) => void;
*/

/**
 * Distinguished trivial check-function.
 *
 * Used to explicitly identify checks that don't need to be performed.
 */
const DO_NOTHING /*: CheckFunction*/ = (importedFile, importedIdsMap, node) => {};

/**
 * Basic set of error messages.
 *
 * These error messages also have automatically-generated versions with a
 * trailing `{{customMessage}}`; see `messages`, below.
 */
const baseMessages = {
  fileImport: "'{{importee}}' may not be imported.",
  fileWhitelist: "'{{importer}}' may not import '{{importee}}' (not whitelisted).",
  fileBlacklist: "'{{importer}}' may not import '{{importee}}' (blacklisted).",
};

/*:: type MessageID = $Keys<typeof baseMessages>; */

// Ponyfill for object.fromEntries.
const objectFromEntries = (arr /*: $ReadOnlyArray<[string, string]>*/) =>
  arr.reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});

/** Full set of error messages. */
const messages = {
  // without custom message
  ...baseMessages,
  // with custom message
  ...objectFromEntries(
    Object.entries(baseMessages).map(([key, val]) => [
      key + '-custom',
      // $FlowFixMe: Object.entries returns [string, mixed][] even for exact types
      val + '{{customMessage}}',
    ]),
  ),
};

module.exports = {
  meta: {
    type: 'problem',

    docs: {
      description: 'disallow imports of files from other files',
      category: 'ECMAScript 6',
      recommended: false,
    },

    messages: messages,

    schema: {
      /* ===== Schema definitions ======================================== */
      definitions: {
        /** Convenience alias. */
        arrayOfStrings: {
          type: 'array',
          items: { type: 'string' },
          uniqueItems: true,
        },

        /** This should match the Flow type `OptionsRecord`, above. */
        OptionsRecord: {
          type: 'object',
          properties: {
            patterns: { $ref: '#/definitions/arrayOfStrings' },
            importerWhitelist: { $ref: '#/definitions/arrayOfStrings' },
            /* not yet implemented! */
            // identifierWhitelist: { $ref: '#/definitions/arrayOfStrings' },
            // identifierBlacklist: { $ref: '#/definitions/arrayOfStrings' },
            message: { type: 'string' },
          },
          additionalProperties: false,
          required: ['patterns'],
        },
      },

      /* ===== Schema: `OptionsRecord[]` ================================= */
      type: 'array',
      items: [{ $ref: '#/definitions/OptionsRecord' }],
    },
  },

  /**
   * Rule entry point.
   *
   * https://eslint.org/docs/developer-guide/working-with-rules#rule-basics
   */
  create(context /*: $FlowFixMe */) {
    const sourceCode = context.getSourceCode();

    const sourceFile /*: string */ = path.relative(process.cwd(), context.getFilename());

    const options /*: $ReadOnlyArray<OptionsRecord> */ = context.options || [];

    /**
     * Given a message name and a custom message, create a reporter function.
     *
     * A reporter function is a kind of check-function which always reports.
     * Reporting is complicated by the need to use the `context.report` API,
     * which requires the caller to have an explicitly-enumerated selection of
     * messages for internationalization purposes.
     */
    const makeReporter = (
      messageName /*: MessageID */,
      customMessage /*: string | void */,
    ) /*: CheckFunction */ => {
      const messageId = customMessage === undefined ? messageName : messageName + '-custom';

      return (importedFile, importedIdsMap, node) => {
        context.report({
          node,
          messageId,
          data: {
            importer: sourceFile,
            importee: importedFile,
            customMessage, // (OK even if undef)
          },
        });
      };
    };

    /**
     * Given a .gitignore-style pattern-set, return a check-function that
     * reports if the imported file is present within it.
     */
    const makePatternOnlyCheck = (patterns /*: Matcher*/, customMessage) /*: CheckFunction*/ => {
      const report = makeReporter('fileImport', customMessage);
      return (importedFile, importedIdsMap, node) => {
        if (patterns.matches(importedFile)) {
          report(importedFile, importedIdsMap, node);
        }
      };
    };

    /**
     * Given a .gitignore-style list, return a check-function that reports
     * if the current source file's path is present/absent, as desired.
     *
     * Underlying implementation function.
     */
    const makeImporterListCheck = (
      importerList /*: $ReadOnlyArray<string> | void */,
      shouldBePresent /*: boolean */,
      messageName /*: MessageID */,
      customMessage /*: string | void */,
    ) /*: CheckFunction */ => {
      if (!importerList) return DO_NOTHING;

      // As it happens, we can always evaluate this condition ahead of time.
      const isPresent = ignore()
        .add(importerList)
        .ignores(sourceFile);
      return isPresent === shouldBePresent ? DO_NOTHING : makeReporter(messageName, customMessage);
    };

    /**
     * Given a .gitignore-style whitelist, return a check-function that reports
     * if the current source file's path is within it.
     */
    const makeImporterWhitelistCheck = (
      importerWhitelist /*: $ReadOnlyArray<string> | void */,
      customMessage /*: string | void */,
    ) /*: CheckFunction */ => {
      return makeImporterListCheck(importerWhitelist, true, 'fileWhitelist', customMessage);
    };

    /**
     * Sequence of all check-functions for all OptionRecords.
     */
    const allChecks /*: $ReadOnlyArray<CheckFunction> */ = options
      .map(record => {
        const { patterns } = record;
        if (patterns.length == 0) return DO_NOTHING;

        const patternsMatcher = new Matcher(patterns);

        const {
          message: customMessage,
          importerWhitelist,
          // identifierWhitelist,
          // identifierBlacklist,
        } = record;

        // If no permission-rules are specified, the pattern-specification is
        // absolute.
        if (
          !importerWhitelist // &&
          // !identifierWhitelist &&
          // !identifierBlacklist
        ) {
          // patterns only
          return makePatternOnlyCheck(patternsMatcher, customMessage);
        }

        // Check function: is this file explicitly allowed to import from here?
        const fileWhitelistCheck = makeImporterWhitelistCheck(
          record.importerWhitelist,
          record.message,
        );

        // All check functions for this record.
        const checks = [
          fileWhitelistCheck,
          // idWhitelistCheck,
          // idBlacklistCheck,
        ].filter(f => f !== DO_NOTHING);
        if (checks.length === 0) return DO_NOTHING;

        return (importedFile, importedIdsMap, node) => {
          if (patternsMatcher.matches(importedFile)) {
            checks.forEach(f => f(importedFile, importedIdsMap, node));
          }
        };
      })
      .filter(f => f !== DO_NOTHING);

    /**
     * Checks a node to see if any problems should be reported.
     * @param {ASTNode} node The node to check.
     * @returns {void}
     * @private
     */
    // Taken from the original ESLint `no-restricted-imports` rule.
    function checkNode(node /*: $FlowFixMe */) {
      const importSource = node.source.value.trim();
      const importNames /*: Map<string, mixed[]> */ = new Map();

      if (node.type === 'ExportAllDeclaration') {
        const starToken = sourceCode.getFirstToken(node, 1);

        importNames.set('*', [{ loc: starToken.loc }]);
      } else if (node.specifiers) {
        for (const specifier of node.specifiers) {
          let name;
          const specifierData = { loc: specifier.loc };

          if (specifier.type === 'ImportDefaultSpecifier') {
            name = 'default';
          } else if (specifier.type === 'ImportNamespaceSpecifier') {
            name = '*';
          } else if (specifier.imported) {
            name = specifier.imported.name;
          } else if (specifier.local) {
            name = specifier.local.name;
          }

          if (name) {
            if (importNames.has(name)) {
              // $FlowFixMe upsert
              importNames.get(name).push(specifierData);
            } else {
              importNames.set(name, [specifierData]);
            }
          }
        }
      }

      const importedFile = path.relative(process.cwd(), path.resolve(sourceFile, importSource));

      allChecks.forEach(f => f(importedFile, importNames, node));
    }

    return {
      ImportDeclaration: checkNode,
      ExportNamedDeclaration(node /*: $FlowFixMe*/) {
        if (node.source) {
          checkNode(node);
        }
      },
      ExportAllDeclaration: checkNode,
    };
  },
};
