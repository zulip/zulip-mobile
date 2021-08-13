/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { BRAND_COLOR, createStyleSheet } from '../styles';
// eslint-disable-next-line import/no-useless-path-segments
import { LoadingIndicator, ZulipStatusBar } from './'; // Like '.'; see #4818.

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
      <View style={componentStyles.center}>
        <LoadingIndicator color="black" size={80} showLogo />
      </View>
    </>
  );
}
