module.exports = {
  /**
   * These two were added to the RN template file in
   * `facebook/react-native@f4d5e8c23` (released in 0.60.5) because of
   * conflicts with `eslint-config-react-native-community`. We haven't
   * activated that config (we might, it's #4119), and we haven't
   * otherwise found a use for these rules; we don't follow them.
   */
  // bracketSpacing: false,
  // jsxBracketSameLine: true,

  printWidth: 100,
  parser: 'babel-flow',
  singleQuote: true,
  trailingComma: 'all',
};
