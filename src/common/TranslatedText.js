/* @flow strict-local */
import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { LocalizableText } from '../types';

type Props = $ReadOnly<{|
  text: LocalizableText,
|}>;

/**
 * A component that seamlessly translates text without
 * applying any styling to it.
 *
 * @prop text - The text to be translated.
 */
export default ({ text }: Props) => {
  const message = typeof text === 'object' ? text.text : text;
  const values = typeof text === 'object' ? text.values : undefined;

  return (
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
  );
};
