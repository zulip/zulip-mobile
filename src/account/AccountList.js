/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, FlatList } from 'react-native';

import type { AccountStatus } from './accountsSelectors';
import { ViewPlaceholder } from '../common';
import AccountItem from './AccountItem';

type Props = $ReadOnly<{|
  accounts: AccountStatus[],
  onAccountSelect: number => void,
  onAccountRemove: number => void,
|}>;

export default class AccountList extends PureComponent<Props> {
  render() {
    const { accounts, onAccountSelect, onAccountRemove } = this.props;

    return (
      <View>
        <FlatList
          data={accounts}
          keyExtractor={item => `${item.email}${item.realm.toString()}`}
          ItemSeparatorComponent={() => <ViewPlaceholder height={8} />}
          renderItem={({ item, index }) => (
            <AccountItem
              index={index}
              showDoneIcon={index === 0 && item.isLoggedIn}
              email={item.email}
              realm={item.realm}
              onSelect={onAccountSelect}
              onRemove={onAccountRemove}
            />
          )}
        />
      </View>
    );
  }
}
