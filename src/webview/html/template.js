/* @flow strict-local */
// $FlowFixMe[untyped-import]
import escape from 'lodash.escape';

/**
 * As an ES6 template tag, escapes HTML in interpolated values,
 * except where marked.
 *
 * To mark a value as HTML to be included raw, use '$!$' instead of '$':
 *   template`Hello ${&<world}` -> 'Hello &amp;&lt;world'
 * but
 *   template`Hello $!${&<world}` -> 'Hello &<world'
 *
 * To include a literal '$!' before a value, write '$\!':
 *   template`Hello $\!${&<world}` -> 'Hello $!&amp;&lt;world'
 */
export default (strings: string[], ...values: Array<string | number>): string => {
  // $FlowIssue[prop-missing] #2616 github.com/facebook/flow/issues/2616
  const raw: string[] = strings.raw; // eslint-disable-line prefer-destructuring
  const result = [];
  values.forEach((value, i) => {
    if (raw[i].endsWith('$!')) {
      result.push(strings[i].substring(0, strings[i].length - 2));
      result.push(value);
    } else {
      result.push(strings[i]);
      result.push(escape(value));
    }
  });
  result.push(strings[strings.length - 1]);
  return result.join('');
};
