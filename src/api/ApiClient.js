import { encodeAsURI } from '../lib/util.js';

const apiVersion = 'api/v1';

export default class ApiClient {
  static getAuthHeader(email, apiKey) {
    const encodedStr = `${email}:${apiKey}`;
    // TODO: btoa may not be available in JavascriptCore
    return `Basic ${btoa(encodedStr)}`;
  }

  static async fetch(account, route, params) {
    const extraParams = {};
    if (account.loggedIn) {
      extraParams.headers = {
        Authorization: ApiClient.getAuthHeader(account.email, account.apiKey),
      };
    }

    const raw = await fetch(`${account.realm}/${apiVersion}/${route}`, {
      ...params,
      ...extraParams,
    });
    try {
      const res = await raw.json();
      return res;
    } catch (err) {
      throw new Error(`HTTP response code ${raw.status}: ${raw.statusText}`);
    }
  }

  static async getAuthBackends(account) {
    try {
      const res = await ApiClient.fetch(account, 'get_auth_backends', {
        method: 'get',
      });

      // Return the available backends as a list
      const backends = [];
      if (res.result === 'success') {
        if (res.password) backends.push('password');
        if (res.google) backends.push('google');
        if (res.dev) backends.push('dev');
      }
      if (!backends) {
        throw new Error('No backends available.');
      }
      return backends;
    } catch (err) {
      // The Zulip server may not support get_auth_backends so we
      // may want to default to returning password and google auth:
      // return ['password', 'google'];
      throw err;
    }
  }

  static async devGetEmails(account) {
    const res = await ApiClient.fetch(account, 'dev_get_emails', {
      method: 'get',
    });
    if (res.result !== 'success') {
      throw new Error(res.msg);
    }
    return [res.direct_admins, res.direct_users];
  }

  static async devFetchApiKey(account, email) {
    const res = await ApiClient.fetch(account, 'dev_fetch_api_key', {
      method: 'post',
      body: encodeAsURI({
        username: email,
      }),
    });
    if (res.result !== 'success') {
      throw new Error(res.msg);
    }
    return res.api_key;
  }

  static async fetchApiKey(account, email, password) {
    const res = await ApiClient.fetch(account, 'fetch_api_key', {
      method: 'post',
      body: encodeAsURI({
        username: email,
        password,
      }),
    });
    if (res.result !== 'success') {
      throw new Error(res.msg);
    }
    return res.api_key;
  }

  static async getMessages(account, anchor, numBefore, numAfter) {
    const params = encodeAsURI({
      anchor,
      num_before: numBefore,
      num_after: numAfter,
    });
    const res = await ApiClient.fetch(account, `messages?${params}`, {
      method: 'get',
    });
    if (res.result !== 'success') {
      throw new Error(res.msg);
    }
    return res.messages;
  }
}
