/* @flow */
export default (text: string, autocompleteText: string) => {
  const lastIndex: number = Math.max(
    text.lastIndexOf(':'),
    text.lastIndexOf('#'),
    text.lastIndexOf('@'),
  );
  const prefix = text[lastIndex] === ':' ? ':' : `${text[lastIndex]}**`;
  const suffix = text[lastIndex] === ':' ? ':' : '**';
  return `${text.substring(0, lastIndex)}${prefix}${autocompleteText}${suffix} `;
};
