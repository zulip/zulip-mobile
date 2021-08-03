/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { createStyleSheet, HALF_COLOR } from '../styles';
import { useSelector } from '../react-redux';
import { getSession } from '../selectors';
import Label from './Label';

const styles = createStyleSheet({
  block: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HALF_COLOR,
  },
  text: {
    fontSize: 14,
    margin: 2,
  },
});

type Props = $ReadOnly<{||}>;

/**
 * Displays a notice that the app is working in offline mode.
 * Not rendered if state is 'online'.
 */
export default function OfflineNotice(props: Props): Node {
  const isOnline = useSelector(state => getSession(state).isOnline);
  if (isOnline === true || isOnline === null) {
    return null;
  }

  return (
    <View style={styles.block}>
      <Label style={styles.text} text="No Internet connection" />
    </View>
  );
}
