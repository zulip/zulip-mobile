/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { ThemeData } from '../styles';
import { ThemeContext, createStyleSheet } from '../styles';
import Label from './Label';

const styles = createStyleSheet({
  header: {
    padding: 10,
  },
});

type Props = $ReadOnly<{|
  text: string,
|}>;

export default class SectionHeader extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    const { text } = this.props;
    return (
      <View style={[styles.header, { backgroundColor: this.context.backgroundColor }]}>
        <Label text={text} />
      </View>
    );
  }
}
