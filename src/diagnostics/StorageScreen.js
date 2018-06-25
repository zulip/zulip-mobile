/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { GlobalState } from '../types';
import { Screen } from '../common';
import SizeItem from './SizeItem';

const calculateKeyStorageSizes = obj =>
  Object.keys(obj)
    .map(key => ({
      key,
      size: JSON.stringify(obj[key]).length * 2,
    }))
    .sort((a, b) => b.size - a.size);

type Props = {
  state: GlobalState,
};

class StorageScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { state } = this.props;
    const storageSizes = calculateKeyStorageSizes(state);

    return (
      <Screen title="Storage">
        <FlatList
          data={storageSizes}
          keyExtractor={item => item.key}
          renderItem={({ item }) => <SizeItem text={item.key} size={item.size} />}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  state,
}))(StorageScreen);
