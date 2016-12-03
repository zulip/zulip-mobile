import base64 from 'base-64';

export const getAuthHeader = (email: string, apiKey: string): ?string =>
  (apiKey ? `Basic ${base64.encode(`${email}:${apiKey}`)}` : undefined);

export const encodeAsURI = (params): string =>
  Object.keys(params).map((key) => (
    `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  )).join('&');

export const getFullUrl = (url: string, realm: string): string =>
  (url.startsWith('/') ? `${realm}${url}` : url);

export const getResourceWithAuth = (uri, realm, authHeader) => ({
  uri: getFullUrl(uri, realm),
  headers: {
    Authorization: getAuthHeader('todo@todo', 'todo_key'),
  },
});
