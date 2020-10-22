/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import { BRAND_COLOR, createStyleSheet } from '../styles';
import { LoadingIndicator, ZulipStatusBar } from '../common';

const styles = createStyleSheet({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR,
  },
});

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, but we
  // do invoke it from one other place (see ZulipMobile.js), it might
  // or might not get the `navigation` prop (with the stack-nav shape)
  // for free.
  navigation?: NavigationStackProp<NavigationStateRoute>,
|}>;

export default class LoadingScreen extends PureComponent<Props> {
  render() {
    return (
      <View style={styles.center}>
        <ZulipStatusBar backgroundColor={BRAND_COLOR} />
        <LoadingIndicator color="black" size={80} showLogo />
      </View>
    );
  }
}
