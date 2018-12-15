/* @flow strict-local */
import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { LocalizableText } from '../types';

type Props = {|
  text: LocalizableText,
|};

/**
 * A component that seamlessly translates text without
 * applying any styling to it.
 *
 * @prop text - The text to be translated.
 */
export default ({ text }: Props) => {
  const message = typeof text === 'object' ? text.text : text;
  const values = typeof text === 'object' ? text.values : undefined;

  return <FormattedMessage id={message} defaultMessage={message} values={values} />;
};
