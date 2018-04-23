/* @flow */
import type { Auth, ResponseExtractionFunc } from '../types';
import { getAuthHeader, encodeAsURI, isValidUrl } from '../utils/url';
import userAgent from '../utils/userAgent';
import { networkActivityStart, networkActivityStop } from '../utils/networkActivity';

const apiVersion = 'api/v1';

export const apiFetch = async (auth: Auth, route: string, params: Object = {}) => {
  const url = `${auth.realm}/${apiVersion}/${route}`;

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

    const json = await response.json();

    if (!response.ok || json.result !== 'success') {
      console.log('Bad response for:', { auth, route, params, response }); // eslint-disable-line
      const error = new Error('API');
      // $FlowFixMe
      error.response = response;
      // $FlowFixMe
      error.code = json.code;
      throw error;
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
  resFunc: ResponseExtractionFunc,
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
