import base64 from 'base-64';
import { encodeAsURI } from '../lib/util';

export type Auth = {
  realm: string,
  apiKey: string,
  email: string,
};

const apiVersion = 'api/v1';

export const getAuthHeader = (email, apiKey) => {
  const encodedStr = `${email}:${apiKey}`;
  return `Basic ${base64.encode(encodedStr)}`;
};

export const apiFetch = async (authObj: Auth, route: string, params: Object) => {
  const auth = authObj.toJS ? authObj.toJS() : authObj;
  const extraParams = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': 'ZulipReactNative',
    },
  };
  if (auth.apiKey) {
    extraParams.headers.Authorization = getAuthHeader(auth.email, auth.apiKey);
  }

  const raw = await fetch(`${auth.realm}/${apiVersion}/${route}`, {
    ...params,
    ...extraParams,
  });
  try {
    const res = await raw.json();
    return res;
  } catch (err) {
    throw new Error(`HTTP response code ${raw.status}: ${raw.statusText}`);
  }
};

export const apiGet = async (
  authObj: Auth,
  route: string,
  params: Object = {},
  resFunc = res => res,
) => {
  const res = await apiFetch(authObj, `${route}?${encodeAsURI(params)}`, {
    method: 'get',
  });
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
) => {
  const res = await apiFetch(authObj, route, {
    method: 'post',
    body: encodeAsURI(params),
  });
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return resFunc(res);
};
