/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AppNavigationProp } from '../nav/AppNavigator';
import UsersProfileCard from './UsersProfileCard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'users'>,
|}>;

export default function UsersInfoScreen(props: Props): Node {
  return (
    <SafeAreaView mode="padding" edges={['top']} style={{ flex: 1 }} scrollEnabled={false}>
      <UsersProfileCard filter="" />
    </SafeAreaView>
  );
}
