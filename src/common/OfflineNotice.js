/* @flow strict-local */

import React, { useEffect } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import * as logging from '../utils/logging';
import { createStyleSheet, HALF_COLOR } from '../styles';
import { useHasStayedTrueForMs } from '../reactUtils';
import { useSelector } from '../react-redux';
import { getGlobalSession } from '../selectors';
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
 * Shows a notice if the app is working in offline mode.
 *
 * Shows a different notice if we've taken longer than we expect to
 * determine Internet reachability. IOW, if the user sees this, there's a
 * bug.
 *
 * Shows nothing if the Internet is reachable.
 */
export default function OfflineNotice(props: Props): Node {
  const isOnline = useSelector(state => getGlobalSession(state).isOnline);

  const shouldShowUncertaintyNotice = useHasStayedTrueForMs(
    // See note in `SessionState` for what this means.
    isOnline === null,

    // A decently long time, much longer than it takes to send `true` or
    // `false` over the RN bridge.
    //
    // Also, one second longer than what we set for
    // `reachabilityRequestTimeout` in NetInfo's config (15s), which is the
    // longest `isOnline` can be `null` on iOS in an expected case. For
    // details, see the comment where we dispatch the action to change
    // `isOnline`.
    //
    // If this time passes and `isOnline` is still `null`, we should treat
    // it as a bug and investigate.
    16 * 1000,
  );

  useEffect(() => {
    if (shouldShowUncertaintyNotice) {
      NetInfo.fetch().then(state => {
        logging.warn('Failed to determine Internet reachability in a reasonable time', state);
      });
    }
  }, [shouldShowUncertaintyNotice]);

  if (shouldShowUncertaintyNotice) {
    return (
      <View style={styles.block}>
        <Label style={styles.text} text="Please check your Internet connection" />
      </View>
    );
  } else if (isOnline === false) {
    return (
      <View style={styles.block}>
        <Label style={styles.text} text="No Internet connection" />
      </View>
    );
  } else {
    return null;
  }
}
