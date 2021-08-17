/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyleSheet, HALF_COLOR } from '../styles';
import type { LocalizableText } from '../types';
import Label from './Label';
import ZulipTextButton from './ZulipTextButton';

const styles = createStyleSheet({
  wrapper: {
    backgroundColor: HALF_COLOR,
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  textRow: {
    flexDirection: 'row',
  },
  text: {
    marginTop: 16,
    lineHeight: 20,
  },
  buttonsRow: {
    marginTop: 12,
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
