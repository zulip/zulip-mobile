/* @flow strict-local */

import type { Insert, Replace, Delete } from '../generateEditSequenceEvent';
import { getEditSequence } from '../generateEditSequenceEvent';

const makeInsert = ({ html, index }): Insert => ({
  type: 'insert',
  index,
  html,
});
const makeDelete = ({ index }): Delete => ({
  type: 'delete',
  index,
});
const makeReplace = ({ html, index }): Replace => ({
  type: 'replace',
  index,
  html,
});

describe('getEditSequence', () => {
  test('throws if oldHtmlItems is unordered', () => {
    const oldHtmlItems = [
      { messageId: 1, type: 'message', html: 'asdf' },
      { messageId: 5, type: 'message', html: 'asdf' },
      { messageId: 4, type: 'message', html: 'asdf' },
    ];
    const newHtmlItems = [
      { messageId: 1, type: 'message', html: 'asdf' },
      { messageId: 3, type: 'message', html: 'asdf' },
      { messageId: 4, type: 'message', html: 'asdf' },
    ];

    expect(() => getEditSequence(oldHtmlItems, newHtmlItems)).toThrow();
  });
  test('throws if newHtmlItems is unordered', () => {
    const oldHtmlItems = [
      { messageId: 1, type: 'message', html: 'asdf' },
      { messageId: 2, type: 'message', html: 'asdf' },
      { messageId: 4, type: 'message', html: 'asdf' },
    ];
    const newHtmlItems = [
      { messageId: 1, type: 'message', html: 'asdf' },
      { messageId: 5, type: 'message', html: 'asdf' },
      { messageId: 4, type: 'message', html: 'asdf' },
    ];

    expect(() => getEditSequence(oldHtmlItems, newHtmlItems)).toThrow();
  });
  test('orders messages correctly', () => {
    const oldHtmlItems = [
      { messageId: 1, type: 'message', html: 'asdf' },
      { messageId: 2, type: 'message', html: 'asdf' },
      { messageId: 4, type: 'message', html: 'asdf' },
      { messageId: 5, type: 'message', html: 'asdf' },
      { messageId: 8, type: 'message', html: 'asdf' },
      { messageId: 10, type: 'message', html: 'asdf' },
    ];
    const newHtmlItems = [
      { messageId: 1, type: 'message', html: 'asdfjkl;' },
      { messageId: 1.5, type: 'message', html: 'asdf' },
      { messageId: 3, type: 'message', html: 'asdf' },
      { messageId: 4, type: 'message', html: 'asdf' },
      { messageId: 5, type: 'message', html: 'asdf' },
      { messageId: 7, type: 'message', html: 'asdf' },
    ];
    const actual = getEditSequence(oldHtmlItems, newHtmlItems);

    const expected = [
      makeReplace({ index: 0, html: 'asdfjkl;' }),
      makeInsert({ index: 1, html: 'asdf' }),
      makeDelete({ index: 2 }),
      makeInsert({ index: 2, html: 'asdf' }),
      makeInsert({ index: 5, html: 'asdf' }),
      makeDelete({ index: 6 }),
      makeDelete({ index: 6 }),
    ];

    expect(expected).toEqual(actual);
  });
  test('handles time pieces, header pieces, and messages correctly', () => {
    const oldHtmlItems = [
      { messageId: 2, type: 'time', html: '<div>timeA</div>' },
      { messageId: 2, type: 'header', html: '<div>headerA</div>' },
      { messageId: 2, type: 'message', html: '<div>messageA</div>' },
    ];
    const newHtmlItems = [
      { messageId: 1, type: 'message', html: 'asdf' },
      { messageId: 2, type: 'time', html: '<div>timeA</div>' },
      { messageId: 2, type: 'header', html: '<div>headerB</div>' },
      { messageId: 2, type: 'message', html: '<div>messageA</div>' },
    ];
    const actual = getEditSequence(oldHtmlItems, newHtmlItems);

    const expected = [
      makeInsert({ index: 0, html: 'asdf' }),
      makeReplace({ index: 2, html: '<div>headerB</div>' }),
    ];

    expect(expected).toEqual(actual);
  });
});
