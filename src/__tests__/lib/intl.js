/* @flow strict-local */

import type { GetText } from '../../types';

// Our translation function, usually given the name _.
export const mock_: GetText = m => (typeof m === 'object' ? m.text : m); // eslint-disable-line no-underscore-dangle
