import React from 'react';
import { View } from 'react-native';
import renderer from 'react-test-renderer';

import { renderHtml } from '../renderHtml';

// We need this hack for now (see: https://github.com/facebook/jest/issues/1760)
beforeAll(() => {
  global.Promise = require.requireActual('promise');
});

const check = (html) => async () => {
  const rendered = await renderHtml(html, { realm: '' });
  const tree = renderer.create(
    <View>{rendered}</View>
  ).toJSON();
  expect(tree).toMatchSnapshot();
};

// Text
test('Empty string', check(''));

test('Short text', check('Hi there!'));

test('Paragraph of text', check(
  '<p>Hey!</p>' +
  '<p>This is a multi-paragraph message</p>'
));

// Links
test('Simple link', check(
  '<a href="https://example.com">Test link</a>'
));
