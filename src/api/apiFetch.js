import base64 from 'base-64';
import { encodeAsURI } from '../utils/url';

export type Auth = {
  realm: string,
  apiKey: string,
  email: string,
};

const apiVersion = 'api/v1';

export const getAuthHeader = (email: string, apiKey: string): ?string =>
  (apiKey ? `Basic ${base64.encode(`${email}:${apiKey}`)}` : undefined);

export const apiFetch = async (
  auth: Auth,
  route: string,
  params: Object = {},
  noTimeout: boolean = false,
) => {
  const url = `${auth.realm}/${apiVersion}/${route}`;
  const allParams = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': 'ZulipReactNative',
      'Authorization': getAuthHeader(auth.email, auth.apiKey),
    },
    ...params,
  };
  return await fetch(url, allParams);
};


export const apiCall = async (
  authObj: Auth,
  route: string,
  params: Object = {},
  resFunc = res => res,
  noTimeout: boolean = false,
  dispatch: () => {},
) => {
  let timeout;
  try {
    if (!noTimeout) {
      timeout = setTimeout(() => {
        throw Error(`Request timed out @ ${route}`);
        // send APP_OFFLINE
      }, 5000);
    }

    const response = await apiFetch(authObj, route, params, noTimeout);
    if (response.status === 401) {
      // TODO: httpUnauthorized()
      throw Error('Unauthorized');
    }

    if (!response.ok) {
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
  await apiCall(authObj, `${route}?${encodeAsURI(params)}`, {
    method: 'get',
  }, resFunc, noTimeout);

export const apiPost = async (authObj, route, params = {}, resFunc, noTimeout) =>
  await apiCall(authObj, route, {
    method: 'post',
    body: encodeAsURI(params),
  }, resFunc, noTimeout);
