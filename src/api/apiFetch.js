import { StatusBar, Platform } from 'react-native';
import { Auth } from '../types';
import { getAuthHeader, encodeAsURI } from '../utils/url';
import userAgent from '../utils/userAgent';
import timeout from '../utils/timeout';

const apiVersion = 'api/v1';

const TIMEOUT_MS = 10000;

// Network activity indicators should be visible if *any* network activity is occurring
let activityCounter = 0;
const activityPush = () => {
  activityCounter++;
  if (Platform.OS === 'ios') {
    StatusBar.setNetworkActivityIndicatorVisible(true);
  }
};
const activityPop = () => {
  activityCounter--;
  if (activityCounter === 0 && Platform.OS === 'ios') {
    StatusBar.setNetworkActivityIndicatorVisible(false);
  }
};

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
      // 'Authorization': getAuthHeader(auth.email, auth.apiKey),
    },
    ...params,
  };
  console.log('apiFetch', url, allParams);
  return fetch(url, allParams);
};

export const apiCall = async (
  auth: Auth,
  route: string,
  params: Object = {},
  resFunc = res => res,
  options: Object = {},
) => {
  try {
    // Show network activity indicator if this fetch is not silent
    if (!options.silent) activityPush();

    // Either the API call or timeout will resolve first and the other will reject
    const promises = [apiFetch(auth, route, params)];
    if (!options.noTimeout) {
      promises.push(timeout(TIMEOUT_MS).then(() => {
        throw Error(`Request timed out @ ${route}`);
      }));
    }
    const response = await Promise.race(promises);

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
    if (!options.silent) activityPop();
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
