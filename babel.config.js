// This file is seen only by Babel 7, not Babel 6.
// There are other semantic differences: see
//   https://babeljs.io/docs/en/config-files

module.exports = {
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
