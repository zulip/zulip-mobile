/* @flow */
export default (avatarUrl: string): string => {
  const matches = new RegExp(/(\w+)\.png/g).exec(avatarUrl);

  if (matches) {
    return avatarUrl.replace(matches[0], `${matches[1]}-medium.png`);
  } else {
    return avatarUrl;
  }
};
