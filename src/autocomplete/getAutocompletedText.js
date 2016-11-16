export default (text: string, autocompleteText: string) => {
  const lastword = text.match(/\b(\w+)$/);
  const prefix = text[lastword.index - 1] === ':' ? '' : '**';
  const suffix = text[lastword.index - 1] === ':' ? ':' : '**';
  const newText = `${text.substring(0, lastword.index)}${prefix}${autocompleteText}${suffix} `;

  return newText;
};
