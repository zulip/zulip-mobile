/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { LoadingIndicator, ZulipStatusBar } from '../common';

const componentStyles = createStyleSheet({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR,
  },
});

type Props = $ReadOnly<{|
  // Since we've put this screen in AppNavigator's route config, but
  // we do invoke it from one other place, which is not a navigator
  // (see ZulipMobile.js), it might or might not get the `navigation`
  // prop (with the particular shape for this route) and the `route`
  // prop for free.
  navigation?: AppNavigationProp<'loading'>,
  route?: RouteProp<'loading', void>,
|}>;

export default function LoadingScreen(props: Props) {
  return (
    <View style={componentStyles.center}>
      <ZulipStatusBar backgroundColor={BRAND_COLOR} />
      <LoadingIndicator color="black" size={80} showLogo />
    </View>
  );
}
