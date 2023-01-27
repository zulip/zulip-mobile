/* @flow strict-local */

import * as React from 'react';
import { View } from 'react-native';
// $FlowFixMe[untyped-import]
import Color from 'color';

import type { LocalizableReactText } from '../types';
import { kWarningColor } from '../styles/constants';
import { createStyleSheet } from '../styles';
import ZulipTextIntl from './ZulipTextIntl';
import ZulipTextButton from './ZulipTextButton';

type Button = {|
  +id: string,
  +label: LocalizableReactText,
  +onPress: () => Promise<void> | void,
|};

type Props = $ReadOnly<{|
  text: LocalizableReactText,
  buttons?: $ReadOnlyArray<Button>,

  /**
   * Give a top margin of the correct in-between space for a set of buttons
   */
  topMargin?: true,

  /**
   * Give a bottom margin of the correct in-between space for a set of
   *   buttons
   */
  bottomMargin?: true,
|}>;

// TODO before reuse: jsdoc
export default function AlertItem(props: Props): React.Node {
  const { text, buttons, topMargin, bottomMargin } = props;

  const styles = React.useMemo(
    () =>
      createStyleSheet({
        surface: {
          padding: 8,
          backgroundColor: Color(kWarningColor).fade(0.9).toString(),
          borderColor: kWarningColor,
          borderWidth: 1,
          borderRadius: 8,
          marginTop: topMargin ? 8 : undefined,
          marginBottom: bottomMargin ? 8 : undefined,
        },
        text: {
          fontWeight: 'bold',
          color: kWarningColor,
        },
        buttonsRow: {
          flexDirection: 'row',
        },
      }),
    [bottomMargin, topMargin],
  );

  return (
    <View style={styles.surface}>
      <ZulipTextIntl style={styles.text} text={text} />
      {buttons && (
        <View style={styles.buttonsRow}>
          {buttons.map(({ id, label, onPress }, index) => (
            <ZulipTextButton
              key={id}
              leftMargin={index !== 0 || undefined}
              label={label}
              onPress={onPress}
            />
          ))}
        </View>
      )}
    </View>
  );
}
