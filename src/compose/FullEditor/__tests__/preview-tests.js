import deepFreeze from 'deep-freeze';
import applyWrapFormat from '../applyWrapFormat';
import applyWrapFormatNewLines from '../applyWrapFormatNewLines';
import applyListFormat from '../applyListFormat';
import applyWebLinkFormat from '../applyWebLinkFormat';

import { writeTextHereString, writeUrlTextHere } from '../placeholderStrings';
import { isStringWebLink } from '../utils';
import urlTestCases from './urlTestCases.json';

describe('applyWrapFormat', () => {
  test('Checks the unselected text', done => {
    const testObject = deepFreeze({ text: 'test', selection: { start: 0, end: 0 } });
    const getState = () => testObject;
    let newState = {};
    const item = deepFreeze({
      key: 'B',
      wrapper: '**',
      onPress: applyWrapFormat,
      icon: 'format-bold',
    });
    const expectedState = deepFreeze({
      text: `${item.wrapper}${item.wrapper}test`,
      selection: {
        start: 2,
        end: 2,
      },
    });

    const setState = (state, callback) => {
      newState = { ...newState, ...state };
      if (state.selection) {
        newState = { ...newState, ...state };
        expect(newState).toEqual(expectedState);
        done();
      }
      if (callback) {
        callback();
      }
    };

    item.onPress({ getState, setState, item });
  });

  test('Checks for selected text', done => {
    const testObject = deepFreeze({ text: 'test', selection: { start: 0, end: 4 } });
    const getState = () => testObject;
    let newState = {};
    const item = deepFreeze({
      key: 'B',
      wrapper: '**',
      onPress: applyWrapFormat,
      icon: 'format-bold',
    });
    const expectedState = deepFreeze({
      text: '**test**',
      selection: {
        start: 8,
        end: 8,
      },
    });

    const setState = (state, callback) => {
      newState = { ...newState, ...state };
      if (state.selection) {
        newState = { ...newState, ...state };
        expect(newState).toEqual(expectedState);
        done();
      }
      if (callback) {
        callback();
      }
    };

    item.onPress({ getState, setState, item });
  });
});

describe('applyWrapFormatNewLines', () => {
  test('Checks the unselected text', done => {
    const testObject = deepFreeze({ text: 'test', selection: { start: 4, end: 4 } });
    const getState = () => testObject;
    let newState = {};
    const item = deepFreeze({
      key: 'CC',
      wrapper: '```',
      onPress: applyWrapFormatNewLines,
      icon: 'code-braces',
    });
    const expectedState = deepFreeze({
      text: 'test\n```\n\n```\n',
      selection: {
        start: 9,
        end: 9,
      },
    });

    const setState = (state, callback) => {
      newState = { ...newState, ...state };
      if (state.selection) {
        newState = { ...newState, ...state };
        expect(newState).toEqual(expectedState);
        done();
      }
      if (callback) {
        callback();
      }
    };

    item.onPress({ getState, setState, item });
  });

  test('Checks for selected text', done => {
    const testObject = deepFreeze({ text: 'test', selection: { start: 0, end: 4 } });
    const getState = () => testObject;
    let newState = {};
    const item = deepFreeze({
      key: 'CC',
      wrapper: '```',
      onPress: applyWrapFormatNewLines,
      icon: 'code-braces',
    });
    const expectedState = deepFreeze({
      text: '```\ntest\n```\n',
      selection: {
        start: 13,
        end: 13,
      },
    });

    const setState = (state, callback) => {
      newState = { ...newState, ...state };
      if (state.selection) {
        newState = { ...newState, ...state };
        expect(newState).toEqual(expectedState);
        done();
      }
      if (callback) {
        callback();
      }
    };

    item.onPress({ getState, setState, item });
  });
});
describe('applyListFormat', () => {
  test('Checks the unselected text at the end of line', done => {
    const testObject = deepFreeze({ text: 'test\n', selection: { start: 5, end: 5 } });
    const getState = () => testObject;
    let newState = {};
    const item = deepFreeze({
      key: 'L',
      prefix: '*',
      onPress: applyListFormat,
      icon: 'format-list-bulleted',
    });
    const expectedState = deepFreeze({
      text: 'test\n* ',
      selection: {
        start: 7,
        end: 7,
      },
    });

    const setState = (state, callback) => {
      newState = { ...newState, ...state };
      if (state.selection) {
        newState = { ...newState, ...state };
        expect(newState).toEqual(expectedState);
        done();
      }
      if (callback) {
        callback();
      }
    };

    item.onPress({ getState, setState, item });
  });
  test('Checks the unselected text', done => {
    const testObject = deepFreeze({ text: 'test', selection: { start: 4, end: 4 } });
    const getState = () => testObject;
    let newState = {};
    const item = deepFreeze({
      key: 'L',
      prefix: '*',
      onPress: applyListFormat,
      icon: 'format-list-bulleted',
    });
    const expectedState = deepFreeze({
      text: 'test\n* ',
      selection: {
        start: 7,
        end: 7,
      },
    });

    const setState = (state, callback) => {
      newState = { ...newState, ...state };
      if (state.selection) {
        newState = { ...newState, ...state };
        expect(newState).toEqual(expectedState);
        done();
      }
      if (callback) {
        callback();
      }
    };

    item.onPress({ getState, setState, item });
  });

  test('Checks for selected text', done => {
    const testObject = deepFreeze({ text: 'test', selection: { start: 0, end: 4 } });
    const getState = () => testObject;
    let newState = {};
    const item = deepFreeze({
      key: 'L',
      prefix: '*',
      onPress: applyListFormat,
      icon: 'format-list-bulleted',
    });
    const expectedState = deepFreeze({
      text: '* test\n',
      selection: {
        start: 7,
        end: 7,
      },
    });

    const setState = (state, callback) => {
      newState = { ...newState, ...state };
      if (state.selection) {
        newState = { ...newState, ...state };
        expect(newState).toEqual(expectedState);
        done();
      }
      if (callback) {
        callback();
      }
    };

    item.onPress({ getState, setState, item });
  });
});

describe('applyWebLinkFormat', () => {
  test('Checks the unselected middle text', done => {
    const testObject = deepFreeze({ text: 'test', selection: { start: 4, end: 4 } });
    const getState = () => testObject;
    let newState = {};
    const item = deepFreeze({ key: 'WEB', onPress: applyWebLinkFormat, icon: 'link' });
    const expectedState = deepFreeze({
      text: `test[${writeTextHereString}](${writeUrlTextHere})`,
      selection: {
        start: 5,
        end: 25,
      },
    });

    const setState = (state, callback) => {
      newState = { ...newState, ...state };
      if (state.selection) {
        newState = { ...newState, ...state };
        expect(newState).toEqual(expectedState);
        done();
      }
      if (callback) {
        callback();
      }
    };

    item.onPress({ getState, setState, item });
  });

  test('Checks for selected url', done => {
    const testObject = deepFreeze({
      text: `${writeUrlTextHere}`,
      selection: { start: 0, end: writeUrlTextHere.length },
    });
    const getState = () => testObject;
    let newState = {};
    const item = deepFreeze({ key: 'WEB', onPress: applyWebLinkFormat, icon: 'link' });
    const expectedState = deepFreeze({
      text: `[${writeTextHereString}](${writeUrlTextHere})`,
      selection: {
        start: 1,
        end: 1 + writeTextHereString.length,
      },
    });

    const setState = (state, callback) => {
      newState = { ...newState, ...state };
      if (state.selection) {
        newState = { ...newState, ...state };
        expect(newState).toEqual(expectedState);
        done();
      }
      if (callback) {
        callback();
      }
    };

    item.onPress({ getState, setState, item });
  });

  test('Checks for selected text', done => {
    const testObject = deepFreeze({
      text: `${writeTextHereString}`,
      selection: { start: 0, end: writeTextHereString.length },
    });
    const getState = () => testObject;
    let newState = {};
    const item = deepFreeze({ key: 'WEB', onPress: applyWebLinkFormat, icon: 'link' });
    const expectedState = deepFreeze({
      text: `[${writeTextHereString}](${writeUrlTextHere})`,
      selection: {
        start: 3 + writeTextHereString.length,
        end: 3 + writeTextHereString.length + writeUrlTextHere.length,
      },
    });

    const setState = (state, callback) => {
      newState = { ...newState, ...state };
      if (state.selection) {
        newState = { ...newState, ...state };
        expect(newState).toEqual(expectedState);
        done();
      }
      if (callback) {
        callback();
      }
    };

    item.onPress({ getState, setState, item });
  });
});

describe('utils', () => {
  let index = 0;
  urlTestCases.forEach(testCase =>
    test(`Test isStringWebLink ${urlTestCases[index++]}`, () => {
      expect(isStringWebLink(testCase)).toBe(true);
    }),
  );
});
