import ReactTestRenderer from 'react-test-renderer';

import htmlToDomTree from '../htmlToDomTree';
import renderHtmlChildren from '../renderHtmlChildren';

const htmlToJson = html =>
  ReactTestRenderer.create(
    renderHtmlChildren({
      childrenNodes: htmlToDomTree(html),
      actions: {},
    }),
  ).toJSON();

describe('renderHtmlChildren', () => {
  test('text renders as <Text />', () => {
    const rendered = htmlToJson('hello');
    expect(rendered.type).toBe('Text');
  });

  test('empty "div" renders as <View /> and no children', () => {
    const rendered = htmlToJson('<div />');
    expect(rendered.type).toBe('View');
    expect(rendered.children).toBe(null);
  });

  test('an "a" renders as <View /> with an onPress handler', () => {
    const rendered = htmlToJson('<a />');
    expect(rendered.type).toBe('View');
  });

  test('a link is rendered as a <Touchable> with <Text /> inside', () => {
    const rendered = htmlToJson('<a>Link text</a>');
    const textNode = rendered.children[0].children[0];
    expect(textNode.type).toBe('Text');
    expect(textNode.children[0]).toEqual('Link text');
  });
});
