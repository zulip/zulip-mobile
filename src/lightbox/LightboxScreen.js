/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { AppNavigationProp } from '../nav/AppNavigator';
import { ZulipStatusBar } from '../common';
import { createStyleSheet } from '../styles';
import Lightbox from './Lightbox';

const styles = createStyleSheet({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'black',
  },
});

type Props = $ReadOnly<{|
  // Since we've put this screen in AppNavigator's route config, and
  // we don't invoke it without type-checking anywhere else (in fact,
  // we don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the particular shape for this
  // route.
  navigation: AppNavigationProp<'lightbox'>,
|}>;

export default class LightboxScreen extends PureComponent<Props> {
  render() {
    const { src, message } = this.props.navigation.state.params;
    return (
      <View style={styles.screen}>
        <ZulipStatusBar hidden backgroundColor="black" />
        <ActionSheetProvider>
          <Lightbox src={src} message={message} />
        </ActionSheetProvider>
      </View>
    );
  }
}
