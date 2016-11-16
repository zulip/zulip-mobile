export default (text: string, autocompleteText: string) => {
  const lastword = text.match(/\b(\w+)$/);
  const suffix = text[lastword.index - 1] === ':' ? ':' : '';
  const newText = `${text.substring(0, lastword.index)}${autocompleteText}${suffix} `;

  return newText;
};
