/* @flow strict-local */

module.exports = async () => {
  // Where this has any effect (macOS and Linux), set Node's timezone to
  // UTC, to help make snapshot tests be consistent in local testing and in
  // CI. To handle places this doesn't have an effect (Windows), we should
  // also modify our code (e.g., in src/utils/date.js) so that, only when
  // testing, they negate the UTC offset of a `Date` object before using it.
  //
  // This is in `globalSetup.js` so that it runs as early as possible; we
  // don't want a wrong TZ value to be cached and then used instead of UTC:
  //   https://github.com/nodejs/node/issues/3449#issuecomment-149583284
  process.env.TZ = 'UTC';
};
