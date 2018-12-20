/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';

import type { Context } from '../types';

type Props = {|
  text: string,
  color: string,
|};

export default class TitlePlain extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles: contextStyles } = this.context;
    const { text, color } = this.props;
    return <Text style={[contextStyles.navTitle, contextStyles.flexed, { color }]}>{text}</Text>;
  }
}
