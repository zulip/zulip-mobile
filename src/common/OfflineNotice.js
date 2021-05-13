/* @flow strict-local */

import React from 'react';
import { View } from 'react-native';

import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { getSession } from '../selectors';
import Label from './Label';

const key = 'OfflineNotice';

const styles = createStyleSheet({
  block: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'hsl(6, 98%, 57%)',
  },
  text: {
    fontSize: 14,
    color: 'white',
    margin: 2,
  },
});

type Props = $ReadOnly<{||}>;

/**
 * Displays a notice that the app is working in offline mode.
 * Not rendered if state is 'online'.
 */
export default function OfflineNotice(props: Props) {
  const isOnline = useSelector(state => getSession(state).isOnline);
  if (isOnline) {
    return null;
  }

  return (
    <View key={key} style={styles.block}>
      <Label style={styles.text} text="No Internet connection" />
    </View>
  );
}
