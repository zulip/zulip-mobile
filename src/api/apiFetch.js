/* @flow */
import type { Auth, ResponseExtractionFunc } from '../types';
import { getAuthHeader, encodeAsURI, isValidUrl } from '../utils/url';
import userAgent from '../utils/userAgent';
import { networkActivityStart, networkActivityStop } from '../utils/networkActivity';

const apiVersion = 'api/v1';

const defaultResFunc: ResponseExtractionFunc = res => res;

export const fetchWithAuth = async (auth: Auth, url: string, params: Object = {}) => {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid url ${url}`);
  }

  const contentType =
    params.body instanceof FormData
      ? 'multipart/form-data'
      : 'application/x-www-form-urlencoded; charset=utf-8';
  const allParams = {
    headers: {
      'Content-Type': contentType,
      'User-Agent': userAgent,
      Authorization: getAuthHeader(auth.email, auth.apiKey),
    },
    ...params,
  };
  return fetch(url, allParams);
};

export const apiFetch = async (auth: Auth, route: string, params: Object = {}) =>
  fetchWithAuth(auth, `${auth.realm}/${apiVersion}/${route}`, params);

const makeApiError = (httpStatus: number, data: ?Object) => {
  const error = new Error('API');
  // $FlowFixMe
  error.data = data;
  // $FlowFixMe
  error.httpStatus = httpStatus;
  return error;
};

export const apiCall = async (
  auth: Auth,
  route: string,
  params: Object = {},
  resFunc: ResponseExtractionFunc = defaultResFunc,
  isSilent: boolean = false,
) => {
  try {
    networkActivityStart(isSilent);
    const response = await apiFetch(auth, route, params);
    const json = await response.json().catch(() => undefined);
    if (response.ok && json !== undefined) {
      return resFunc(json);
    }
    throw makeApiError(response.status, json);
  } finally {
    networkActivityStop(isSilent);
  }
};

export const apiGet = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: Object = {},
  isSilent: boolean = false,
) =>
  apiCall(
    auth,
    `${route}?${encodeAsURI(params)}`,
    {
      method: 'get',
    },
    resFunc,
    isSilent,
  );

export const apiPost = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: Object = {},
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

export const apiFile = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  body: FormData,
) =>
  apiCall(
    auth,
    route,
    {
      method: 'post',
      body,
    },
    resFunc,
  );

export const apiPut = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
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
  resFunc: ResponseExtractionFunc = defaultResFunc,
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
  resFunc: ResponseExtractionFunc = defaultResFunc,
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

export const apiHead = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: Object = {},
) =>
  apiCall(
    auth,
    `${route}?${encodeAsURI(params)}`,
    {
      method: 'head',
    },
    resFunc,
  );
