/* @flow strict-local */

import * as React from 'react';
import { View } from 'react-native';

import SwitchRow from '../common/SwitchRow';
import NestedNavRow from '../common/NestedNavRow';
import type { LocalizableReactText } from '../types';
import { createStyleSheet } from '../styles';
import { QUARTER_COLOR } from '../styles/constants';
import ZulipTextIntl from '../common/ZulipTextIntl';

type Props = $ReadOnly<{|
  /**
   * The current style works best if this ends in a colon.
   */
  // The need to suggest a colon is probably a sign that we can improve the
  // layout in some subtle way.
  title: LocalizableReactText,

  children: $ReadOnlyArray<React$Element<typeof SwitchRow> | React$Element<typeof NestedNavRow>>,
|}>;

export default function SettingsGroup(props: Props): React.Node {
  const { title, children } = props;

  const styles = React.useMemo(
    () =>
      createStyleSheet({
        container: {
          overflow: 'hidden',
          backgroundColor: QUARTER_COLOR, // TODO: Better color
          marginVertical: 4,
        },
        headerContainer: {
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
          minHeight: 48,
        },
      }),
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ZulipTextIntl text={title} />
      </View>
      {children}
    </View>
  );
}
