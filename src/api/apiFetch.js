import base64 from 'base-64';
import { encodeAsURI } from '../lib/util';
// import { APP_ONLINE, APP_OFFLINE } from

export type Auth = {
  realm: string,
  apiKey: string,
  email: string,
};

const apiVersion = 'api/v1';

export const getAuthHeader = (email: string, apiKey: string): ?string =>
  (apiKey ? `Basic ${base64.encode(`${email}:Q${apiKey}`)}` : undefined);

export const apiFetch = async (
  authObj: Auth,
  route: string,
  params: Object = {},
  resFunc = res => res,
  noTimeout: boolean = false,
  dispatch: () => {},
) => {
  const auth = authObj.toJS ? authObj.toJS() : authObj;
  const url = `${auth.realm}/${apiVersion}/${route}`;
  const allParams = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': 'ZulipReactNative',
      'Authorization': getAuthHeader(auth.email, auth.apiKey),
    },
    ...params,
  };

  let timeout;
  try {
    if (!noTimeout) {
      timeout = setTimeout(() => {
        throw Error(`Request timed out @ ${route}`);
        // send APP_OFFLINE
      }, 5000);
    }
    console.log('BEFORE FETCH');
    const response = await fetch(url, allParams);
    console.log('AFTER FETCH');
    if (!response.ok) {
      console.log('ERROR', response);
      throw Error(response.statusText);
    }

    // send APP_ONLINE

    const json = await response.json();

    if (json.result !== 'success') {
      throw new Error(json.msg);
    }

    return resFunc(json);
  } finally {
    clearTimeout(timeout);
  }
};

export const apiGet = async (authObj, route, params = {}, resFunc, noTimeout) =>
  await apiFetch(authObj, `${route}?${encodeAsURI(params)}`, {
    method: 'get',
  }, resFunc, noTimeout);

export const apiPost = async (authObj, route, params = {}, resFunc, noTimeout) =>
  await apiFetch(authObj, route, {
    method: 'post',
    body: encodeAsURI(params),
  }, resFunc, noTimeout);
