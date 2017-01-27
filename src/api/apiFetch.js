import { Auth } from '../types';
import { getAuthHeader, encodeAsURI } from '../utils/url';
import userAgent from '../utils/userAgent';

const apiVersion = 'api/v1';

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
      'User-Agent': userAgent,
      'Authorization': getAuthHeader(auth.email, auth.apiKey),
    },
    ...params,
  };
  return fetch(url, allParams);
};


export const apiCall = async (
  auth: Auth,
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
        // TODO: the throw below does not get caught and crashes the app
        // throw Error(`Request timed out @ ${route}`);
        // send APP_OFFLINE
      }, 5000);
    }

    const response = await apiFetch(auth, route, params, noTimeout);
    if (response.status === 401) {
      // TODO: httpUnauthorized()
      throw Error('Unauthorized');
    }

    if (!response.ok) {
      console.log(response); // eslint-disable-line
      throw Error(response.statusText);
    }

    // send APP_ONLINE

    const json = await response.json();

    if (json.result !== 'success') {
      console.error(json.msg); // eslint-disable-line
      throw new Error(json.msg);
    }

    return resFunc(json);
  } finally {
    clearTimeout(timeout);
  }
};

export const apiGet = async (auth, route, params = {}, resFunc, noTimeout) =>
  apiCall(auth, `${route}?${encodeAsURI(params)}`, {
    method: 'get',
  }, resFunc, noTimeout);

export const apiPost = async (auth, route, params = {}, resFunc, noTimeout) =>
  apiCall(auth, route, {
    method: 'post',
    body: encodeAsURI(params),
  }, resFunc, noTimeout);
