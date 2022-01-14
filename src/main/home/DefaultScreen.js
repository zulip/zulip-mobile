/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RouteProp } from '../../react-navigation';
import type { HomeDrawerNavigationProp } from './HomeDrawerNavigator';
import { TopTabButton } from '../../nav/TopTabButton';
import UnreadCards from '../../unread/UnreadCards';
import { createStyleSheet } from '../../styles';
import { LoadingBanner } from '../../common';
import ServerCompatBanner from '../../common/ServerCompatBanner';
import ServerPushSetupBanner from '../../common/ServerPushSetupBanner';

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  iconList: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

type Props = $ReadOnly<{|
  navigation: HomeDrawerNavigationProp<'default'>,
  route: RouteProp<'default', void>,
|}>;

export default function DefaultScreen(props: Props): Node {
  return (
    <SafeAreaView mode="padding" edges={['top']} style={styles.wrapper}>
      <View style={styles.iconList}>
        <TopTabButton
          name="menu"
          onPress={() => {
            props.navigation.openDrawer();
          }}
        />
      </View>
      <ServerCompatBanner />
      <ServerPushSetupBanner />
      <LoadingBanner />
      <UnreadCards />
    </SafeAreaView>
  );
}
