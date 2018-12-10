/* @flow */
import React, { PureComponent } from 'react';

import Input from './Input';
import type { Props as InputProps } from './Input';

type Props = $Diff<InputProps, { multiline: mixed, underlineColorAndroid: mixed }>;

/**
 * Provides multi-line capabilities on top of an Input component.
 *
 * All props are passed through to `Input`.  See `Input` for descriptions.
 */
export default class MultilineInput extends PureComponent<Props> {
  render() {
    return <Input {...this.props} multiline underlineColorAndroid="transparent" />;
  }
}
