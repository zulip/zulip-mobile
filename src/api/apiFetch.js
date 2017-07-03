/* @flow */
import { Auth, ResponseExtractionFunc } from '../types';
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
  resFunc: ResponseExtractionFunc = res => res,
  isSilent: boolean = false,
  shouldTimeout: boolean = true,
) => {
  try {
    // Show network activity indicator if this fetch is not silent
    networkActivityStart(isSilent);
    const response = await timeout(
      await apiFetch(auth, route, params),
      () => { throw new Error(`Request timed out @ ${route}`); },
      // shouldTimeout, # WTF ITS BOOL ;-( WE NEED NUMBER
    );
    if (response.status === 401) {
      // TODO: httpUnauthorized()
      console.log('Unauthorized for:', auth, route, params); // eslint-disable-line
      throw Error('Unauthorized');
    }

    const json = await response.json();

    if (!response.ok || json.result !== 'success') {
      console.log('Bad response for:', auth, route, params); // eslint-disable-line
      throw new Error(json.msg);
    }

    // send APP_ONLINE

    return resFunc(json);
  } finally {
    networkActivityStop(isSilent);
  }
};

export const apiGet = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc,
  params: Object = {},
) =>
  apiCall(auth, `${route}?${encodeAsURI(params)}`, {
    method: 'get',
  }, resFunc);

export const apiPost = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc,
  params: Object = {},
) =>
  apiCall(auth, route, {
    method: 'post',
    body: encodeAsURI(params),
  }, resFunc);

export const apiPut = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc,
  params: Object = {},
) =>
  apiCall(auth, route, {
    method: 'put',
    body: encodeAsURI(params),
  }, resFunc);

export const apiDelete = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc,
  params: Object = {},
) =>
  apiCall(auth, route, {
    method: 'delete',
    body: encodeAsURI(params),
  }, resFunc);

export const apiPatch = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc,
  params: Object = {},
) =>
  apiCall(auth, route, {
    method: 'patch',
    body: encodeAsURI(params),
  }, resFunc);
