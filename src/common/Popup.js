/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node as React$Node } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  children: React$Node,
|}>;

/**
 * A floating box to contain autocomplete popups.
 *
 * Avoids the horizontal insets by adding appropriate margin.
 */
export default class Popup extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    return (
      <SafeAreaView
        mode="margin"
        edges={['right', 'left']}
        style={[{ backgroundColor: this.context.backgroundColor }, styles.popup]}
      >
        {this.props.children}
      </SafeAreaView>
    );
  }
}
