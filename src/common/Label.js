/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import TranslatedText from './TranslatedText';

import type { BoundedDiff } from '../generics';
import RawLabel from './RawLabel';
import type { LocalizableReactText } from '../types';

type Props = $ReadOnly<{|
  ...BoundedDiff<$Exact<React$ElementConfig<typeof RawLabel>>, {| +children: ?Node |}>,
  text: LocalizableReactText,
|}>;

/**
 * A wrapper for `RawLabel` that also translates the text.
 *
 * Use `RawLabel` instead if you don't want the text translated.
 *
 * Unlike `RawLabel`, only accepts a `LocalizableReactText`, as the `text`
 * prop, and doesn't support `children`.
 */
export default class Label extends PureComponent<Props> {
  render(): Node {
    const { text, ...restProps } = this.props;

    return (
      <RawLabel {...restProps}>
        <TranslatedText text={text} />
      </RawLabel>
    );
  }
}
