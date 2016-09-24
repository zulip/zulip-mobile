import base64 from 'base-64';
import { encodeAsURI } from '../lib/util.js';

const apiVersion = 'api/v1';

export type Account = {
  accountId: number,
  activeBackend: 'dev' | 'google' | 'password',
  apiKey: string,
  authBackends: string[],
  email: string,
  directAdmins?: string[],
  directUsers?: string[],
  loggedIn: boolean,
  realm: string,
};

export type Presence = {
  client: string,
  pushable: boolean,
  status: 'active' | 'inactive',
  timestamp: number,
};

export type ClientPresence = {
  [key: string]: Presence,
};

export type Presences = {
  [key: string]: ClientPresence,
};

export default class ApiClient {
  static getAuthHeader(email, apiKey) {
    const encodedStr = `${email}:${apiKey}`;
    return `Basic ${base64.encode(encodedStr)}`;
  }

  static async fetch(account: Account, route: string, params: Object) {
    const extraParams = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'User-Agent': 'ZulipReactNative',
      },
    };
    if (account.loggedIn) {
      extraParams.headers.Authorization = ApiClient.getAuthHeader(account.email, account.apiKey);
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

  static async getAuthBackends(account: Account) {
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
  }

  static async devGetEmails(account: Account) {
    const res = await ApiClient.fetch(account, 'dev_get_emails', {
      method: 'get',
    });
    if (res.result !== 'success') {
      throw new Error(res.msg);
    }
    return [res.direct_admins, res.direct_users];
  }

  static async devFetchApiKey(account: Account, email: string) {
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

  static async fetchApiKey(account: Account, email: string, password: string) {
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

  static async getMessages(
    account: Account,
    anchor: number,
    numBefore: number,
    numAfter: number,
    narrow: Object
  ) {
    const params = encodeAsURI({
      anchor,
      num_before: numBefore,
      num_after: numAfter,
      narrow: JSON.stringify(narrow),
    });
    const res = await ApiClient.fetch(account, `messages?${params}`, {
      method: 'get',
    });
    if (res.result !== 'success') {
      throw new Error(res.msg);
    }
    return res.messages;
  }

  static async focusPing(account: Account, hasFocus: boolean, newUserInput: boolean): Presences {
    const res = await ApiClient.fetch(account, 'users/me/presence', {
      method: 'post',
      body: encodeAsURI({
        status: hasFocus ? 'active' : 'idle',
        new_user_input: newUserInput,
      }),
    });
    if (res.result !== 'success') {
      throw new Error(res.msg);
    }
    return res.presences;
  }

  static async messagesFlags(
    account: Account,
    messages: number[],
    op: string,
    flag: string,
  ): number[] {
    const res = await ApiClient.fetch(account, 'messages/flags', {
      method: 'post',
      body: encodeAsURI({
        messages,
        flag,
        op,
      }),
    });
    if (res.result !== 'success') {
      throw new Error(res.msg);
    }
    return res.messages;
  }
}
