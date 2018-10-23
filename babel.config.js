// This file is seen only by Babel 7, not Babel 6.
// There are other semantic differences: see
//   https://babeljs.io/docs/en/config-files

module.exports = {
  // Ignore the .babelrc; ours is incompatible for now with Babel 7,
  // because the old `react-native` preset is.
  babelrc: false,

  presets: ['module:metro-react-native-babel-preset'],

  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
