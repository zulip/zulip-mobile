/* @flow */
import htmlparser from 'htmlparser2';

export default (html: string) => {
  let domTree = null;
  const parser = new htmlparser.Parser(
    new htmlparser.DomHandler((err, dom) => {
      if (!err) domTree = dom;
    }),
  );
  parser.write(html);
  parser.done();
  return domTree;
};
