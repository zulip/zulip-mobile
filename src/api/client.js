import { encodeAsURI } from '../lib/util.js';

const apiVersion = 'api/v1';

export default class ApiClient {
  constructor(realm) {
    this.realm = realm;
    this.route = (route) => `${realm}/${apiVersion}/${route}`;
  }

  authHeader() {
    const encodedStr = `${this.email}:${this.apiKey}`;
    return `Basic ${btoa(encodedStr)}`;
  }

  fetch(route, data) {
    return new Promise((resolve, reject) => {
      fetch(this.route(route), data).then((raw) => raw.json())
      .then((res) => {
        if (res.result === 'success') {
          resolve(res);
        } else {
          // Error: received an error message from backend
          reject(`${res.msg}`);
        }
      }).catch((err) => {
        // Error: unable to connect to endpoint
        reject(err);
      });
    });
  }

  fetchApiKey(email, password) {
    return new Promise((resolve, reject) => {
      this.fetch('fetch_api_key', {
        method: 'post',
        body: encodeAsURI({
          username: email,
          password,
        }),
      }).then((res) => {
        this.email = email;
        this.apiKey = res.api_key;
        resolve(res.api_key);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  getMessages(anchor, numBefore, numAfter) {
    return new Promise((resolve, reject) => {
      const params = encodeAsURI({
        anchor,
        num_before: numBefore,
        num_after: numAfter,
      });
      this.fetch(`messages?${params}`, {
        method: 'get',
        headers: {
          Authorization: this.authHeader(),
        },
      }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}
