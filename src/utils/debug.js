/* @flow */
export const shouldComponentUpdateWithDebug = (props: Object, nextProps: Object) => {
  const keys = Object.keys(props);
  let change = false;
  for (let i = 0; i < keys.length; i++) {
    if (nextProps[keys[i]] !== props[keys[i]]) {
      console.log(`⚠️ ${keys[i]} has changed from %o to %o`, props[keys[i]], nextProps[keys[i]]); // eslint-disable-line
      change = true;
    }
  }

  return change;
};
