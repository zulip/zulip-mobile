// This file is seen only by Babel 7, not Babel 6.
// There are other semantic differences: see
//   https://babeljs.io/docs/en/config-files

module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
  ],
  plugins: [
    // We can remove this once it's included in
    // metro-react-native-babel-preset; see
    // https://github.com/facebook/metro/issues/645. It's already in
    // @babel/reset-env, but that doesn't get used as a base plugin; see a
    // comment on that issue explaining why.
    '@babel/plugin-proposal-numeric-separator',
  ],
};
