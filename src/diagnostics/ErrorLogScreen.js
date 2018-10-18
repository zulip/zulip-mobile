/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import { Screen, SearchEmptyState } from '../common';
import ErrorLogItem from './ErrorLogItem';
import { errorList } from '../utils/logging';

export default class ErrorLogScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen title="Errors">
        {errorList.length === 0 ? (
          <SearchEmptyState text="No errors logged" />
        ) : (
          <FlatList
            data={errorList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <ErrorLogItem {...item} />}
          />
        )}
      </Screen>
    );
  }
}
