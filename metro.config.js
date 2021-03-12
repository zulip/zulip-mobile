// @format

const path = require('path');

// Packages we might apply `yarn link` to.
// TODO compute what packages actually *are* under `yarn link` instead.
const linkablePackages = [
  '@zulip/shared',
  'zulip-markdown-parser',
  // Add more as needed!  See also .flowconfig and docs/howto/yarn-link.md .
];

// Most of the complexity here comes from teaching Metro to properly
// handle the case where we're using `yarn link` to get packages from
// worktrees outside the zulip-mobile tree: e.g., to make
// `node_modules/@zulip/shared` be a symlink into a zulip.git worktree.
//
// Out of the box, Metro (in e.g. the guise of `react-native start`)
// breaks in that situation in two ways:
//  * Imports of modules in those packages fail.
//  * Once that's fixed, imports *from* modules in those packages, of
//    modules found in our node_modules, fail.
//
// In both cases, the symptom is a red-screen error in the (debug)
// app, and in Metro a stacktrace under a message saying "Unable to
// resolve module [...] does not exist in the Haste module map".

/** Absolute path to the directory at the root of the given package. */
const packagePath = packageName => path.dirname(require.resolve(`${packageName}/package.json`));

/** Direct (not transitive) dependencies of the given package. */
const packageDeps = packageName => Object.keys(require(`${packageName}/package.json`).dependencies);

// Backport of Object.fromEntries... backported to plain JS from our src/jsBackport.js.
function objectFromEntries(entries) {
  const obj = {};
  entries.forEach(entry => {
    obj[entry[0]] = entry[1];
  });
  return obj;
}

// Backport of Array.flatMap.
function arrayFlatMap(a, f) {
  return [].concat(...a.map(f));
}

module.exports = {
  // This causes Metro to even look outside the zulip-mobile tree in
  // the first place.
  watchFolders: linkablePackages.map(packagePath),

  resolver: {
    // These are to help Metro find modules imported from files found
    // outside our tree.  Without it, Metro tries to resolve them from
    // the ancestor directories of those files and doesn't look in our
    // own node_modules.
    extraNodeModules: objectFromEntries(
      // @babel/runtime makes the list because our Babel config (?) causes
      // files like @zulip/shared/js/typing_status.js to need it, whereas
      // it's not a dependency of @zulip/shared itself.
      ['@babel/runtime', ...arrayFlatMap(linkablePackages, packageDeps)].map(name => [
        name,
        packagePath(name),
      ]),
    ),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
