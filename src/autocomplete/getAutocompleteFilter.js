/* @flow */
import type { InputSelectionType } from '../types';

export default (text: string, selection: InputSelectionType) => {
  const { start, end } = selection;
  if (start === end && start !== text.length) {
    // new letter is typed
    text = text.substring(0, start);
  }
  const lastIndex: number = Math.max(
    text.lastIndexOf(':'),
    text.lastIndexOf('#'),
    text.lastIndexOf('@'),
  );
  const lastWordPrefix: string = lastIndex !== -1 ? text[lastIndex] : '';
  const filter: string =
    text.length > lastIndex + 1 ? text.substring(lastIndex + 1, text.length) : '';

  return { lastWordPrefix, filter };
};
