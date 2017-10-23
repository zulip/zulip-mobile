/* @flow */
import store from '../boot/store';
import type { Auth, ResponseExtractionFunc } from '../types';
import { getAuthHeader, encodeAsURI } from '../utils/url';
import userAgent from '../utils/userAgent';
import { networkActivityStart, networkActivityStop } from './networkActivity';
import { navigateToInternalErrorScreen } from '../nav/navActions';

const apiVersion = 'api/v1';

export const apiFetch = async (auth: Auth, route: string, params: Object = {}) => {
  const url = `${auth.realm}/${apiVersion}/${route}`;
  const allParams = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': userAgent,
      Authorization: getAuthHeader(auth.email, auth.apiKey),
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
    networkActivityStart(isSilent);
    const response = await apiFetch(auth, route, params);

    if (response.status === 401) {
      // TODO: httpUnauthorized()
      console.log('Unauthorized for:', auth, route, params); // eslint-disable-line
      throw Error('Unauthorized');
    } else if (response.status === 500) {
      store.dispatch(navigateToInternalErrorScreen(route));
    }

    const json = await response.json();

    if (!response.ok || json.result !== 'success') {
      console.log('Bad response for:', auth, route, params, response.status); // eslint-disable-line
      throw new Error(json.msg);
    }

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
  isSilent: boolean = false,
  shouldTimeout: boolean = true,
) =>
  apiCall(
    auth,
    `${route}?${encodeAsURI(params)}`,
    {
      method: 'get',
    },
    resFunc,
    isSilent,
    shouldTimeout,
  );

export const apiPost = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc,
  params: Object = {},
  isSilent: boolean = false,
  shouldTimeout: boolean = true,
) =>
  apiCall(
    auth,
    route,
    {
      method: 'post',
      body: encodeAsURI(params),
    },
    resFunc,
  );

export const apiPut = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc,
  params: Object = {},
) =>
  apiCall(
    auth,
    route,
    {
      method: 'put',
      body: encodeAsURI(params),
    },
    resFunc,
  );

export const apiDelete = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc,
  params: Object = {},
) =>
  apiCall(
    auth,
    route,
    {
      method: 'delete',
      body: encodeAsURI(params),
    },
    resFunc,
  );

export const apiPatch = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc,
  params: Object = {},
) =>
  apiCall(
    auth,
    route,
    {
      method: 'patch',
      body: encodeAsURI(params),
    },
    resFunc,
  );
