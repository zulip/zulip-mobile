export const encodeAsURI = (params) =>
  Object.keys(params).map((key) => (
    `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  )).join('&');
