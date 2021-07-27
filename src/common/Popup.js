/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { ThemeData } from '../styles';
import { ThemeContext, createStyleSheet } from '../styles';

const styles = createStyleSheet({
  popup: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 5,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 3,
    maxHeight: 250,
  },
});

type Props = $ReadOnly<{|
  children: Node,
|}>;

export default class Popup extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    return (
      <View style={[{ backgroundColor: this.context.backgroundColor }, styles.popup]}>
        {this.props.children}
      </View>
    );
  }
}
