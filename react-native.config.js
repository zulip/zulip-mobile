/**
 * See https://github.com/react-native-community/cli/blob/master/docs/configuration.md.
 *
 * To print the full config from the React Native CLI, run
 * `react-native config`.
 */
module.exports = {
  /**
   * See https://github.com/react-native-community/cli/blob/master/docs/dependencies.md.
   *
   * Currently, we only use this to blacklist some native-code
   * libraries, per-platform, that we don't want to be linked with
   * "autolinking".
   *
   * For more about "autolinking", see
   * https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.
   */
  dependencies: {
    'react-native-notifications': {
      platforms: {
        // We don't use this Wix library in the Android build. See 01b33ad31.
        android: null,
      },
    },
    'react-native-screens': {
      platforms: {
        // We haven't enabled `react-native-screens` yet, that's
        // #4111.
        android: null,
      },
    },
    'react-native-vector-icons': {
      platforms: {
        // We're using a setup that doesn't involve linking
        // `VectorIconsPackage` on Android.
        android: null,
      },
    },
  },
};
