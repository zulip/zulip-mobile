/* @flow */
import { MatchResult } from '../types';

export default (text: string, autocompleteText: string) => {
  const lastword: MatchResult = text.match(/\b(\w+)$/);
  if (lastword) {
    const prefix = text[lastword.index - 1] === ':' ? '' : '**';
    const suffix = text[lastword.index - 1] === ':' ? ':' : '**';
    return `${text.substring(0, lastword.index)}${prefix}${autocompleteText}${suffix} `;
  }
  return lastword;
};
