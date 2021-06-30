/* @flow strict-local */
// $FlowFixMe[untyped-import]
import escape from 'lodash.escape';
import template from '../template';

describe('template', () => {
  const evil = '<alert />&amp;';
  const escaped = escape(evil);

  test('interpolates', () => {
    expect(template``).toEqual('');
    expect(template`a`).toEqual('a');
    expect(template`a${'b'}c`).toEqual('abc');
  });

  test('escapes HTML', () => {
    expect(template`a${evil}c`).toEqual(`a${escaped}c`);
  });

  test('optionally preserves HTML', () => {
    expect(template`a$!${evil}c`).toEqual(`a${evil}c`);
  });

  test('has an escape for the option', () => {
    expect(template`a$\!${evil}c`).toEqual(`a$!${escaped}c`);
  });
});
