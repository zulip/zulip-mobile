module.exports = (wallaby) => ({
  files: ['src/**/*.js', '!src/**/__tests__/*.js'],
  tests: ['src/**/__tests__/*.js'],
  env: {
    type: 'node',
    runner: 'node',
  },
  testFramework: 'jest',
  compilers: {
    'src/**/*.js': wallaby.compilers.babel(),
  },
  setup: () =>
    wallaby.testFramework.configure({
     // https://facebook.github.io/jest/docs/api.html#config-options
     // you may just pass `require('./package.json').jest`, if you use it for your Jest config
     // don't forget to include package.json in the files list in this case
    }),
});
