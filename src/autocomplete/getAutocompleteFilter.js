/* @flow */
export default (text: string) => {
  const lastIndex: number = Math.max(
    text.lastIndexOf(':'),
    text.lastIndexOf('#'),
    text.lastIndexOf('@'),
  );
  const lastWordPrefix: string = lastIndex !== -1 ? text[lastIndex] : '';
  const filter: string =
    text.length > lastIndex + 1 ? text.substring(lastIndex + 1, text.length) : '';

  return filter !== '' && lastWordPrefix !== '' && { lastWordPrefix, filter };
};
