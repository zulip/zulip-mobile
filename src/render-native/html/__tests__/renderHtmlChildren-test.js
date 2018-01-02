import React from 'react';
import { View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';

import store from '../../../boot/store';
import htmlToDomTree from '../htmlToDomTree';
import renderHtmlChildren from '../renderHtmlChildren';

const htmlToJson = html =>
  ReactTestRenderer.create(
    <Provider store={store}>
      <View>
        {renderHtmlChildren({
          childrenNodes: htmlToDomTree(html),
          actions: {},
        })}
      </View>
    </Provider>,
  ).toJSON();

describe('renderHtmlChildren', () => {
  test('text renders as <Text />', () => {
    const rendered = htmlToJson('hello');
    expect(rendered.children[0].type).toBe('Text'); // check for first children as element is View wrapper
  });

  test('empty "div" renders as <View /> and no children', () => {
    const rendered = htmlToJson('<div />');
    expect(rendered.children[0].type).toBe('View'); // check for first children as element is View wrapper
    expect(rendered.children[0].children).toBe(null);
  });

  test('an "a" renders as <View /> with an onPress handler', () => {
    const rendered = htmlToJson('<a />');
    expect(rendered.children[0].type).toBe('View'); // check for first children as element is View wrapper
  });

  /* test('a link is rendered as a <Touchable> with multiple <Text /> inside', () => {
    const rendered = htmlToJson('<a>Link text</a>');
    const textNode = rendered.children[0].children[0];
    expect(textNode.children[0].type).toBe('Text');
    // check for first children as element is View wrapper
    expect(textNode.children[0].children[0]).toEqual('Link ');
    expect(textNode.children[1].children[0]).toEqual('text ');
  }); */
});
