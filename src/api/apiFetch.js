/* @flow strict-local */
import * as Sentry from '@sentry/react-native';
import type { UrlParams } from '../utils/url';
import type { Auth } from './transportTypes';
import { getAuthHeaders } from './transport';
import { encodeParamsForUrl, isValidUrl } from '../utils/url';
import userAgent from '../utils/userAgent';
import { networkActivityStart, networkActivityStop } from '../utils/networkActivity';
import { type CallData, makeErrorFromApi } from './apiErrors';

/**
 * Additional parameters passed through to `fetch()`.
 *
 * (This is therefore a strict subset of `RequestOptions`, the actual second
 * argument type of `fetch()`.)
 */
type FetchParams = {| method: string, body?: string | FormData |};

const apiVersion = 'api/v1';

export const getFetchRequestOptions = (auth: Auth, params: FetchParams): RequestOptions => {
  const contentType =
    params.body instanceof FormData
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

export const fetchWithAuth = async (auth: Auth, url: string, params: FetchParams) => {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid url ${url}`);
  }

  return fetch(url, getFetchRequestOptions(auth, params));
};

type ApiFetchParams = {| auth: Auth, route: string, ...FetchParams |};

/**
 * Internal auxiliary function. Perform an API call.
 *
 * @param auth: The relevant {@link Auth}.
 * @param route: The route, given as a URL relative to the API root.
 * @param params: Any additional parameters will ultimately be forwarded to
 *   `fetch()`.
 */
const apiFetch = async ({ auth, route, ...params }: ApiFetchParams) =>
  fetchWithAuth(auth, `${auth.realm}/${apiVersion}/${route}`, params);

/**
 * Internal auxiliary function. Perform an API call, handling failure with
 * appropriate logging and exceptions.
 *
 * @param params: Parameters to be forwarded to {@link apiFetch}.
 * @param getCallData: A closure which returns the (semi-)raw route and API
 *    parameters, as presented to the calling function. Called only on failure.
 * @param isSilent: True if this fetch should not trigger the network activity
 *    indicator on iOS. (Should be `true` only for long-polling API calls.)
 */
export const apiCall = async (
  params: ApiFetchParams,
  getCallData: () => $Diff<CallData, {| method: mixed |}>,
  isSilent: boolean = false,
) => {
  try {
    networkActivityStart(isSilent);
    const response = await apiFetch(params);
    const json = await response.json().catch(() => undefined);
    if (response.ok && json !== undefined) {
      return json;
    }

    const callData = { ...getCallData(), method: params.method };
    const logData = {
      route: params.route,
      params: {
        method: params.method,
        // `body: undefined` would probably be harmless, but avoid it anyway
        ...(params.body !== undefined ? { body: params.body } : {}),
      },
      httpStatus: response.status,
      json,
    };
    // eslint-disable-next-line no-console
    console.log(logData);
    Sentry.addBreadcrumb({ category: 'api', level: 'info', data: logData });
    throw makeErrorFromApi(callData, response.status, json);
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
    {
      auth,
      route: `${route}?${encodeParamsForUrl(params)}`,
      method: 'get',
    },
    () => ({ route, params }),
    isSilent,
  );

export const apiPost = async (auth: Auth, route: string, params: UrlParams = {}) =>
  apiCall(
    {
      auth,
      route,
      method: 'post',
      body: encodeParamsForUrl(params),
    },
    () => ({ route, params }),
  );

export const apiFile = async (auth: Auth, route: string, body: FormData) =>
  apiCall(
    {
      auth,
      route,
      method: 'post',
      body,
    },
    () => ({ route, params: { body: '[form data]' } }),
  );

export const apiPut = async (auth: Auth, route: string, params: UrlParams = {}) =>
  apiCall(
    {
      auth,
      route,
      method: 'put',
      body: encodeParamsForUrl(params),
    },
    () => ({ route, params }),
  );

export const apiDelete = async (auth: Auth, route: string, params: UrlParams = {}) =>
  apiCall(
    {
      auth,
      route,
      method: 'delete',
      body: encodeParamsForUrl(params),
    },
    () => ({ route, params }),
  );

export const apiPatch = async (auth: Auth, route: string, params: UrlParams = {}) =>
  apiCall(
    {
      auth,
      route,
      method: 'patch',
      body: encodeParamsForUrl(params),
    },
    () => ({ route, params }),
  );

export const apiHead = async (auth: Auth, route: string, params: UrlParams = {}) =>
  apiCall(
    {
      auth,
      route: `${route}?${encodeParamsForUrl(params)}`,
      method: 'head',
    },
    () => ({ route, params }),
  );
