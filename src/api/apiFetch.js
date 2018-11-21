/* @flow */
import type { UrlParams } from '../utils/url';
import type { Account, ResponseExtractionFunc } from './apiTypes';
import { getAuthHeader, encodeParamsForUrl, isValidUrl } from '../utils/url';
import userAgent from '../utils/userAgent';
import { networkActivityStart, networkActivityStop } from '../utils/networkActivity';

const apiVersion = 'api/v1';

const defaultResFunc: ResponseExtractionFunc = res => res;

export const getFetchParams = (account: Account, params: Object = {}) => {
  const contentType =
    params.body instanceof FormData
      ? 'multipart/form-data'
      : 'application/x-www-form-urlencoded; charset=utf-8';

  return {
    headers: {
      'Content-Type': contentType,
      'User-Agent': userAgent,
      ...(account.apiKey ? { Authorization: getAuthHeader(account.email, account.apiKey) } : {}),
    },
    ...params,
  };
};

export const fetchWithAuth = async (account: Account, url: string, params: Object = {}) => {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid url ${url}`);
  }

  return fetch(url, getFetchParams(account, params));
};

export const apiFetch = async (account: Account, route: string, params: Object = {}) =>
  fetchWithAuth(account, `${account.realm}/${apiVersion}/${route}`, params);

const makeApiError = (httpStatus: number, data: ?Object) => {
  const error = new Error('API');
  // $FlowFixMe
  error.data = data;
  // $FlowFixMe
  error.httpStatus = httpStatus;
  return error;
};

export const apiCall = async (
  account: Account,
  route: string,
  params: Object = {},
  resFunc: ResponseExtractionFunc = defaultResFunc,
  isSilent: boolean = false,
) => {
  try {
    networkActivityStart(isSilent);
    const response = await apiFetch(account, route, params);
    const json = await response.json().catch(() => undefined);
    if (response.ok && json !== undefined) {
      return resFunc(json);
    }
    // eslint-disable-next-line no-console
    console.warn({ route, params, httpStatus: response.status, json });
    throw makeApiError(response.status, json);
  } finally {
    networkActivityStop(isSilent);
  }
};

export const apiGet = async (
  account: Account,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
  isSilent: boolean = false,
) =>
  apiCall(
    account,
    `${route}?${encodeParamsForUrl(params)}`,
    {
      method: 'get',
    },
    resFunc,
    isSilent,
  );

export const apiPost = async (
  account: Account,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
) =>
  apiCall(
    account,
    route,
    {
      method: 'post',
      body: encodeParamsForUrl(params),
    },
    resFunc,
  );

export const apiFile = async (
  account: Account,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  body: FormData,
) =>
  apiCall(
    account,
    route,
    {
      method: 'post',
      body,
    },
    resFunc,
  );

export const apiPut = async (
  account: Account,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
) =>
  apiCall(
    account,
    route,
    {
      method: 'put',
      body: encodeParamsForUrl(params),
    },
    resFunc,
  );

export const apiDelete = async (
  account: Account,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
) =>
  apiCall(
    account,
    route,
    {
      method: 'delete',
      body: encodeParamsForUrl(params),
    },
    resFunc,
  );

export const apiPatch = async (
  account: Account,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
) =>
  apiCall(
    account,
    route,
    {
      method: 'patch',
      body: encodeParamsForUrl(params),
    },
    resFunc,
  );

export const apiHead = async (
  account: Account,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
) =>
  apiCall(
    account,
    `${route}?${encodeParamsForUrl(params)}`,
    {
      method: 'head',
    },
    resFunc,
  );
