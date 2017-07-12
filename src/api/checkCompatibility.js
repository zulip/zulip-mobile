/* @flow */
import config from '../config';
import userAgent from '../utils/userAgent';

// check with server if current mobile app is compatible with latest backend
// compatibility fails only if server responds with 400 (but not with 200 or 404)
export default () =>
  fetch(config.compatibilityUrl, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': userAgent,
    },
  });
