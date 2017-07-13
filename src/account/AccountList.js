/* @flow */
import React from 'react';
import { View, FlatList } from 'react-native';

import type { Auth } from '../types';
import AccountItem from './AccountItem';

export default class AccountList extends React.PureComponent {
  props: {
    auth: Auth,
    accounts: any[],
    onAccountSelect: number => void,
    onAccountRemove: number => void,
  };

  render() {
    const { accounts, onAccountSelect, onAccountRemove, auth } = this.props;

    return (
      <View>
        <FlatList
          keyboardShouldPersistTaps="always"
          data={accounts}
          keyExtractor={item => `${item.email}${item.realm}`}
          renderItem={({ item, index }) =>
            <AccountItem
              key={`${item.email}${item.realm}`}
              index={index}
              showDoneIcon={index === 0 && auth.apiKey !== '' && auth.apiKey === item.apiKey}
              {...item}
              onSelect={onAccountSelect}
              onRemove={onAccountRemove}
            />}
        />
      </View>
    );
  }
}
