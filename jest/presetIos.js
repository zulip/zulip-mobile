/**
 * The preset we're making tweaks to.
 */
const basePreset = require('../node_modules/jest-expo/ios/jest-preset.js');

// See comment in our Jest config about how this is used.
module.exports = {
  ...basePreset,
  setupFiles: [
    require.resolve('./savePromise.js'),
    ...basePreset.setupFiles,
    require.resolve('./restorePromise.js'),
  ],
};
