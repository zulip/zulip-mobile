/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node, Context } from 'react';
import { View } from 'react-native';

import type { ThemeData } from '../styles';
import { ThemeContext, createStyleSheet } from '../styles';
import Label from './Label';

const styles = createStyleSheet({
  header: {
    padding: 10,
    backgroundColor: 'hsla(0, 0%, 50%, 0.75)',
  },
});

type Props = $ReadOnly<{|
  text: string,
|}>;

export default class SectionHeader extends PureComponent<Props> {
  static contextType: Context<ThemeData> = ThemeContext;
  context: ThemeData;

  render(): Node {
    const { text } = this.props;
    return (
      <View style={[styles.header, { backgroundColor: this.context.backgroundColor }]}>
        <Label text={text} />
      </View>
    );
  }
}
