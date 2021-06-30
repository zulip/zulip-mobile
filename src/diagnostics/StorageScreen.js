/* @flow strict-local */

import React from 'react';
import { FlatList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { GlobalState, Dispatch } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import SizeItem from './SizeItem';

const calculateKeyStorageSizes = obj =>
  Object.keys(obj)
    .map(key => ({
      key,
      size: JSON.stringify(obj[key]).length * 2,
    }))
    .sort((a, b) => b.size - a.size);

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'storage'>,
  route: RouteProp<'storage', void>,

  dispatch: Dispatch,
  state: GlobalState,
|}>;

function StorageScreen(props: Props) {
  const { state } = props;
  const storageSizes = calculateKeyStorageSizes(state);

  return (
    <Screen title="Storage" scrollEnabled={false}>
      <FlatList
        data={storageSizes}
        keyExtractor={item => item.key}
        renderItem={({ item }) => <SizeItem text={item.key} size={item.size} />}
      />
    </Screen>
  );
}

export default connect(state => ({
  state,
}))(StorageScreen);
