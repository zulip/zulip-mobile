/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { FormattedMessage } from 'react-intl';

import type { BoundedDiff } from '../generics';
import ZulipText from './ZulipText';
import type { LocalizableReactText } from '../types';

type Props = $ReadOnly<{|
  ...BoundedDiff<$Exact<React$ElementConfig<typeof ZulipText>>, {| +children: ?Node |}>,
  text: LocalizableReactText,
|}>;

/**
 * A wrapper for `ZulipText` that translates the text with react-intl
 *
 * Use `ZulipText` instead if you don't want the text translated.
 *
 * Unlike `ZulipText`, only accepts a `LocalizableReactText`, as the `text`
 * prop, and doesn't support `children`.
 */
export default function ZulipTextIntl(props: Props): Node {
  const { text, ...restProps } = props;

  const message = typeof text === 'object' ? text.text : text;
  const values = typeof text === 'object' ? text.values : undefined;

  return (
    <ZulipText {...restProps}>
      <FormattedMessage
        id={message}
        // If you see this in dev, it means there's a user-facing string
        // that hasn't been added to
        // static/translations/messages_en.json. Please add it! :)
        defaultMessage={
          process.env.NODE_ENV === 'development' ? `UNTRANSLATED—${message}—UNTRANSLATED` : message
        }
        values={values}
      />
    </ZulipText>
  );
}
