import userAgent from '../utils/userAgent';

export default (realm: string) =>
  fetch(`${realm}/compatibility`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': userAgent,
    },
  });
