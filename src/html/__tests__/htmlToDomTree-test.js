import htmlToDomTree from '../htmlToDomTree';

describe('htmlToDomTree', () => {
  test('parses html and returns an object', () => {
    const domTree = htmlToDomTree('<div class="hello" />');
    expect(domTree[0].name).toBe('div');
    expect(domTree[0].attribs.class).toBe('hello');
  });
});
