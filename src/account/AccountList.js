/* @flow */
import React from 'react';
import { View } from 'react-native';

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
        {accounts.map((account, i) =>
          <AccountItem
            key={account.apiKey}
            index={i}
            showDoneIcon={i === 0 && auth.apiKey !== '' && auth.apiKey === account.apiKey}
            {...account}
            onSelect={onAccountSelect}
            onRemove={onAccountRemove}
          />,
        )}
      </View>
    );
  }
}
