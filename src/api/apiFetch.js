/* @flow */
import type { UrlParams } from '../utils/url';
import type { Auth } from './apiTypes';
import { getAuthHeader, encodeParamsForUrl, isValidUrl } from '../utils/url';
import userAgent from '../utils/userAgent';
import { networkActivityStart, networkActivityStop } from '../utils/networkActivity';

const apiVersion = 'api/v1';

type ResponseExtractionFunc = (response: Object) => any;

const defaultResFunc: ResponseExtractionFunc = res => res;

export const objectToParams = (obj: Object) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (Array.isArray(obj[key])) {
      newObj[key] = JSON.stringify(obj[key]);
    } else if (obj[key] === undefined) {
      // do nothing, skip key
    } else {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

export const getFetchParams = (auth: Auth, params: Object = {}) => {
  const contentType =
    params.body instanceof FormData
      ? 'multipart/form-data'
      : 'application/x-www-form-urlencoded; charset=utf-8';

  return {
    headers: {
      'Content-Type': contentType,
      'User-Agent': userAgent,
      ...(auth.apiKey ? { Authorization: getAuthHeader(auth.email, auth.apiKey) } : {}),
    },
    ...params,
  };
};

export const fetchWithAuth = async (auth: Auth, url: string, params: Object = {}) => {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid url ${url}`);
  }

  return fetch(url, getFetchParams(auth, params));
};

export const apiFetch = async (
  auth: Auth,
  route: string,
  params: Object = {},
  isStaticUrl: boolean,
) =>
  fetchWithAuth(
    auth,
    isStaticUrl ? `${auth.realm}/${route}` : `${auth.realm}/${apiVersion}/${route}`,
    params,
  );

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
  isStaticUrl: boolean = false,
) => {
  try {
    networkActivityStart(isSilent);
    const response = await apiFetch(auth, route, params, isStaticUrl);
    const json = await response.json().catch(() => undefined);
    if (response.ok && json !== undefined) {
      return resFunc(json);
    }
    // eslint-disable-next-line no-console
    console.log({ route, params, httpStatus: response.status, json });
    throw makeApiError(response.status, json);
  } finally {
    networkActivityStop(isSilent);
  }
};

export const apiGet = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
  isSilent: boolean = false,
  isStaticUrl: boolean = false,
) =>
  apiCall(
    auth,
    `${route}?${encodeParamsForUrl(params)}`,
    {
      method: 'get',
    },
    resFunc,
    isSilent,
    isStaticUrl,
  );

export const apiPost = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
) =>
  apiCall(
    auth,
    route,
    {
      method: 'post',
      body: encodeParamsForUrl(params),
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
  params: UrlParams = {},
) =>
  apiCall(
    auth,
    route,
    {
      method: 'put',
      body: encodeParamsForUrl(params),
    },
    resFunc,
  );

export const apiDelete = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
) =>
  apiCall(
    auth,
    route,
    {
      method: 'delete',
      body: encodeParamsForUrl(params),
    },
    resFunc,
  );

export const apiPatch = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
) =>
  apiCall(
    auth,
    route,
    {
      method: 'patch',
      body: encodeParamsForUrl(params),
    },
    resFunc,
  );

export const apiHead = async (
  auth: Auth,
  route: string,
  resFunc: ResponseExtractionFunc = defaultResFunc,
  params: UrlParams = {},
) =>
  apiCall(
    auth,
    `${route}?${encodeParamsForUrl(params)}`,
    {
      method: 'head',
    },
    resFunc,
  );
