/* @flow */
import htmlparser from 'htmlparser2';

import type { DomElement } from '../../types';
import timing from '../../utils/timing';

export default (html: string): DomElement[] => {
  timing.startGroup('HTML parsing');

  let domTree = null;
  const parser = new htmlparser.Parser(
    new htmlparser.DomHandler((err, dom) => {
      if (!err) domTree = dom;
    }),
  );
  parser.write(html);
  parser.done();

  timing.endGroup('HTML parsing');
  return domTree || [];
};
