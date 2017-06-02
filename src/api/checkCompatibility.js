/* @flow */
import config from '../config';
import userAgent from '../utils/userAgent';

export default () =>
  fetch(config.compatibilityUrl, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': userAgent,
    },
  });
