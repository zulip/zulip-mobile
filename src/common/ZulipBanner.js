/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyleSheet, HALF_COLOR } from '../styles';
import type { LocalizableText } from '../types';
import Label from './Label';
import ZulipTextButton from './ZulipTextButton';

// `textRow` and `buttonsRow` are named for the more common case where
// there's not enough room for the text and the button(s) to share a single
// row.
//
// But we do support having the text and button(s) share a row if there's
// room, i.e., if the entities' combined widths are less than or equal to
// one row width. The spec gives an example of this in an illustration where
// the text just takes one line and there's only one action button.
//
// TODO(?): The vertical centering logic for when the text and buttons share
//   a row isn't pixel-perfect; it depends on explicit padding/margin values
//   instead of declaring "center" somewhere. This is an intentional
//   compromise to reduce complexity while still supporting the two-row
//   layout. If we find an elegant solution, we should use it.
const styles = createStyleSheet({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: HALF_COLOR,
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
    paddingTop: 10,
  },
  textRow: {
    flexGrow: 1,
    flexDirection: 'row',
    marginBottom: 12,
  },
  text: {
    marginTop: 6,
    lineHeight: 20,
  },
  buttonsRow: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

type Button = $ReadOnly<{|
  id: string,
  label: LocalizableText,
  onPress: () => void,
|}>;

type Props = $ReadOnly<{|
  visible: boolean,
  text: LocalizableText,
  buttons: $ReadOnlyArray<Button>,
|}>;

/**
 * A banner that follows Material Design specifications as much as possible.
 *
 * See https://material.io/components/banners.
 */
// Please consult the Material Design doc before making layout changes, and
// try to make them in a direction that brings us closer to the guidelines.
export default function ZulipBanner(props: Props): Node {
  const { visible, text, buttons } = props;

  if (!visible) {
    return null;
  }

  return (
    <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.wrapper}>
      <View style={styles.textRow}>
        <Label style={styles.text} text={text} />
      </View>
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
    </SafeAreaView>
  );
}
