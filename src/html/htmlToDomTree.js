/* @flow */
import htmlparser from 'htmlparser2';

import type { DomElement } from '../types';

export default (html: string): DomElement[] => {
  let domTree = null;
  const parser = new htmlparser.Parser(
    new htmlparser.DomHandler((err, dom) => {
      if (!err) domTree = dom;
    }),
  );
  parser.write(html);
  parser.done();
  return domTree || [];
};
