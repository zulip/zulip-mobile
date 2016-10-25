import base64 from 'base-64';
import { encodeAsURI } from '../lib/util';

export type Auth = {
  realm: string,
  apiKey: string,
  email: string,
};

const apiVersion = 'api/v1';

export const getAuthHeader = (email, apiKey) =>
  `Basic ${base64.encode(`${email}:${apiKey}`)}`;

// fetch("http://httpstat.us/500")


export const apiFetch = async (
  authObj: Auth,
  route: string,
  params: Object,
  doNotTimeout: boolean = false,
) => {
  const auth = authObj.toJS ? authObj.toJS() : authObj;
  const url = `${auth.realm}/${apiVersion}/${route}`;
  const extraParams = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': 'ZulipReactNative',
      'Authorization': getAuthHeader(auth.email, auth.apiKey),
    },
  };

  const allParams = {
    ...params,
    ...extraParams,
  };
  if (auth.apiKey) {
    extraParams.headers.Authorization = getAuthHeader(auth.email, auth.apiKey);
  }

  let timeout;
  try {
    if (!doNotTimeout) {
      timeout = setTimeout(() => { throw Error(`Request timed out @ ${route}`); }, 5000);
    }
    console.log('setTimeout', timeout);
    const response = await fetch(url, allParams);

    // console.log('ERROR', err); redux => action for error
    if (!response.ok) throw Error(response.statusText);
    // Error(`HTTP response code ${response.status}: ${response.statusText}`);

    return await response.json();
  } finally {
    console.log('clearTimeout', timeout);
    clearTimeout(timeout);
  }
};

export const apiGet = async (
  authObj: Auth,
  route: string,
  params: Object = {},
  resFunc = res => res,
  doNotTimeout: boolean = false,
) => {
  const res = await apiFetch(authObj, `${route}?${encodeAsURI(params)}`, {
    method: 'get',
  }, doNotTimeout);
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return resFunc(res);
};

export const apiPost = async (
  authObj: Auth,
  route: string,
  params: Object = {},
  resFunc = res => res,
  doNotTimeout: boolean = false,
) => {
  const res = await apiFetch(authObj, route, {
    method: 'post',
    body: encodeAsURI(params),
  }, doNotTimeout);
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return resFunc(res);
};
