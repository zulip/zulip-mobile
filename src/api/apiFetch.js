import { Auth } from '../types';
import { getAuthHeader, encodeAsURI } from '../utils/url';
import userAgent from '../utils/userAgent';
import { timeout } from '../utils/async';
import { networkActivityStart, networkActivityStop } from './networkActivity';

const apiVersion = 'api/v1';

export const apiFetch = async (
  auth: Auth,
  route: string,
  params: Object = {},
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
  isSilent: boolean = false,
  shouldTimeout: boolean = true,
) => {
  try {
    // Show network activity indicator if this fetch is not silent
    networkActivityStart(isSilent);
    const response = await timeout(
      await apiFetch(auth, route, params),
      () => { throw new Error(`Request timed out @ ${route}`); },
      shouldTimeout,
    );
    if (response.status === 401) {
      // TODO: httpUnauthorized()
      throw Error('Unauthorized');
    }

    const json = await response.json();

    if (!response.ok || json.result !== 'success') {
      throw new Error(json.msg);
    }

    // send APP_ONLINE

    return resFunc(json);
  } finally {
    networkActivityStop(isSilent);
  }
};

export const apiGet = async (auth, route, params = {}, resFunc, options) =>
  apiCall(auth, `${route}?${encodeAsURI(params)}`, {
    method: 'get',
  }, resFunc, options);

export const apiPost = async (auth, route, params = {}, resFunc, options) =>
  apiCall(auth, route, {
    method: 'post',
    body: encodeAsURI(params),
  }, resFunc, options);

export const apiPut = async (auth, route, params = {}, resFunc, options) =>
  apiCall(auth, route, {
    method: 'put',
    body: encodeAsURI(params),
  }, resFunc, options);

export const apiDelete = async (auth, route, params = {}, resFunc, options) =>
  apiCall(auth, route, {
    method: 'delete',
    body: encodeAsURI(params),
  }, resFunc, options);
