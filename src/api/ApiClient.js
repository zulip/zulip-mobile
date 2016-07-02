import { encodeAsURI } from '../lib/util.js';

const apiVersion = 'api/v1';

export default class ApiClient {
  static getAuthHeader(email, apiKey) {
    const encodedStr = `${email}:${apiKey}`;
    return `Basic ${btoa(encodedStr)}`;
  }

  static devGetEmails(realm) {
    return fetch(`${realm}/${apiVersion}/dev_get_emails`, {
      method: 'get',
    });
  }

  static devFetchApiKey(realm, email) {
    return fetch(`${realm}/${apiVersion}/dev_fetch_api_key`, {
      method: 'post',
      body: encodeAsURI({
        username: email,
      }),
    });
  }

  static fetchApiKey(realm, email, password) {
    return fetch(`${realm}/${apiVersion}/fetch_api_key`, {
      method: 'post',
      body: encodeAsURI({
        username: email,
        password,
      }),
    });
  }

  static getMessages(realm, email, apiKey, anchor, numBefore, numAfter) {
    const params = encodeAsURI({
      anchor,
      num_before: numBefore,
      num_after: numAfter,
    });
    return fetch(`${realm}/${apiVersion}/messages?${params}`, {
      method: 'get',
      headers: {
        Authorization: ApiClient.getAuthHeader(email, apiKey),
      },
    });
  }
}
