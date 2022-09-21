/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { BRAND_COLOR, createStyleSheet } from '../styles';
import LoadingIndicator from './LoadingIndicator';
import ZulipStatusBar from './ZulipStatusBar';

const componentStyles = createStyleSheet({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR,
  },
});

type Props = $ReadOnly<{||}>;

/**
 * Meant to be used to cover the whole screen.
 */
export default function FullScreenLoading(props: Props): Node {
  return (
    <>
      <ZulipStatusBar backgroundColor={BRAND_COLOR} />
      {
        // No need for `OfflineNoticePlaceholder` here: the content, a
        // loading indicator centered on the whole screen, isn't near the
        // top of the screen, so it doesn't need protection from being
        // hidden under the offline notice.
      }
      <View style={componentStyles.center}>
        <LoadingIndicator color="black" size={80} showLogo />
      </View>
    </>
  );
}
