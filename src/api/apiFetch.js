/* @flow strict-local */
import * as Sentry from '@sentry/react-native';
import type { UrlParams } from '../utils/url';
import type { Auth } from './transportTypes';
import { getAuthHeaders } from './transport';
import { encodeParamsForUrl, isValidUrl } from '../utils/url';
import userAgent from '../utils/userAgent';
import { networkActivityStart, networkActivityStop } from '../utils/networkActivity';
import { makeErrorFromApi } from './apiErrors';

const apiVersion = 'api/v1';

export const getFetchParams = <P: $Diff<$Exact<RequestOptions>, {| headers: mixed |}>>(
  auth: Auth,
  params: P,
): RequestOptions => {
  const { body } = params;
  const contentType =
    body instanceof FormData
      ? 'multipart/form-data'
      : 'application/x-www-form-urlencoded; charset=utf-8';

  return {
    headers: {
      'Content-Type': contentType,
      'User-Agent': userAgent,
      ...getAuthHeaders(auth),
    },
    ...params,
  };
};

export const fetchWithAuth = async (
  auth: Auth,
  url: string,
  params: $Diff<$Exact<RequestOptions>, {| headers: mixed |}>,
) => {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid url ${url}`);
  }

  return fetch(url, getFetchParams(auth, params));
};

export const apiFetch = async (
  auth: Auth,
  route: string,
  params: $Diff<$Exact<RequestOptions>, {| headers: mixed |}>,
) => fetchWithAuth(auth, `${auth.realm}/${apiVersion}/${route}`, params);

export const apiCall = async (
  auth: Auth,
  route: string,
  params: $Diff<$Exact<RequestOptions>, {| headers: mixed |}>,
  isSilent: boolean = false,
) => {
  try {
    networkActivityStart(isSilent);
    const response = await apiFetch(auth, route, params);
    const json = await response.json().catch(() => undefined);
    if (response.ok && json !== undefined) {
      return json;
    }
    // eslint-disable-next-line no-console
    console.log({ route, params, httpStatus: response.status, json });
    Sentry.addBreadcrumb({
      category: 'api',
      level: 'info',
      data: { route, params, httpStatus: response.status, json },
    });
    throw makeErrorFromApi(response.status, json);
  } finally {
    networkActivityStop(isSilent);
  }
};

export const apiGet = async (
  auth: Auth,
  route: string,
  params: UrlParams = {},
  isSilent: boolean = false,
) =>
  apiCall(
    auth,
    `${route}?${encodeParamsForUrl(params)}`,
    {
      method: 'get',
    },
    isSilent,
  );

export const apiPost = async (auth: Auth, route: string, params: UrlParams = {}) =>
  apiCall(auth, route, {
    method: 'post',
    body: encodeParamsForUrl(params),
  });

export const apiFile = async (auth: Auth, route: string, body: FormData) =>
  apiCall(auth, route, {
    method: 'post',
    body,
  });

export const apiPut = async (auth: Auth, route: string, params: UrlParams = {}) =>
  apiCall(auth, route, {
    method: 'put',
    body: encodeParamsForUrl(params),
  });

export const apiDelete = async (auth: Auth, route: string, params: UrlParams = {}) =>
  apiCall(auth, route, {
    method: 'delete',
    body: encodeParamsForUrl(params),
  });

export const apiPatch = async (auth: Auth, route: string, params: UrlParams = {}) =>
  apiCall(auth, route, {
    method: 'patch',
    body: encodeParamsForUrl(params),
  });

export const apiHead = async (auth: Auth, route: string, params: UrlParams = {}) =>
  apiCall(auth, `${route}?${encodeParamsForUrl(params)}`, {
    method: 'head',
  });
