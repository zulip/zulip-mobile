/* @flow strict-local */

import type { GetText } from '../../types';

// Our translation function, usually given the name _.
// eslint-disable-next-line no-underscore-dangle
export const mock_: GetText = m => {
  if (typeof m === 'object') {
    if (m.text === '{_}') {
      // $FlowIgnore[incompatible-indexer]
      /* $FlowIgnore[incompatible-cast]
         We expect an `m.values` that corresponds to `m.text`. */
      const values = (m.values: {| +_: string |});
      return values._;
    }
    return m.text;
  }
  return m;
};
