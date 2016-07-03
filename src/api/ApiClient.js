import { encodeAsURI } from '../lib/util.js';

const apiVersion = 'api/v1';

export default class ApiClient {
  static getAuthHeader(email, apiKey) {
    const encodedStr = `${email}:${apiKey}`;
    // TODO: btoa may not be available in JavascriptCore
    return `Basic ${btoa(encodedStr)}`;
  }

  static fetch(account, route, params) {
    const extraParams = {};
    if (account.loggedIn) {
      extraParams.headers = {
        Authorization: ApiClient.getAuthHeader(account.email, account.apiKey),
      };
    }
    return fetch(`${account.realm}/${apiVersion}/${route}`, { ...params, ...extraParams })
    .then((raw) => raw.json());
  }

  static getAuthBackends(account) {
    return ApiClient.fetch(account, 'get_auth_backends', {
      method: 'get',
    })
    .then((res) => {
      // Return the available backends as a list
      const backends = [];
      if (res.result === 'success') {
        if (res.password) backends.push('password');
        if (res.google) backends.push('google');
        if (res.dev) backends.push('dev');
      }
      return backends;
    }).catch(() => {
      // The Zulip server may not support get_auth_backends
      return ['password', 'google'];
    });
  }

  static devGetEmails(account) {
    return ApiClient.fetch(account, 'dev_get_emails', {
      method: 'get',
    });
  }

  static devFetchApiKey(account, email) {
    return ApiClient.fetch(account, 'dev_fetch_api_key', {
      method: 'post',
      body: encodeAsURI({
        username: email,
      }),
    });
  }

  static fetchApiKey(account, email, password) {
    return ApiClient.fetch(account, 'fetch_api_key', {
      method: 'post',
      body: encodeAsURI({
        username: email,
        password,
      }),
    });
  }

  static getMessages(account, anchor, numBefore, numAfter) {
    const params = encodeAsURI({
      anchor,
      num_before: numBefore,
      num_after: numAfter,
    });
    return ApiClient.fetch(account, `messages?${params}`, {
      method: 'get',
    });
  }
}
