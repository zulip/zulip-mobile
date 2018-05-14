/* @flow */
import React, { PureComponent } from 'react';
import { View, FlatList } from 'react-native';

import type { Auth, Account } from '../types';
import AccountItem from './AccountItem';

type Props = {
  auth: Auth,
  accounts: Account[],
  onAccountSelect: number => void,
  onAccountRemove: number => any,
};

export default class AccountList extends PureComponent<Props> {
  props: Props;

  render() {
    const { accounts, onAccountSelect, onAccountRemove, auth } = this.props;

    return (
      <View>
        <FlatList
          data={accounts}
          keyExtractor={item => `${item.email}${item.realm}`}
          renderItem={({ item, index }) => (
            <AccountItem
              index={index}
              showDoneIcon={index === 0 && auth.apiKey !== '' && auth.apiKey === item.apiKey}
              {...item}
              onSelect={onAccountSelect}
              onRemove={onAccountRemove}
            />
          )}
        />
      </View>
    );
  }
}
