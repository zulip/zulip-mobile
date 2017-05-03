import React from 'react';
import { View } from 'react-native';

import AccountItem from './AccountItem';

export default class AccountList extends React.PureComponent {

  props: {
    accounts: any[],
    onAccountSelect: () => void,
    onAccountRemove: () => void,
  };

  render() {
    const { accounts, onAccountSelect, onAccountRemove, auth } = this.props;

    return (
      <View>
        {accounts.map((account, i) =>
          <AccountItem
            key={i}
            index={i}
            showDoneIcon={i === 0 && auth.apiKey !== '' && auth.apiKey === account.apiKey}
            {...account}
            onSelect={onAccountSelect}
            onRemove={onAccountRemove}
          />
        )}
      </View>
    );
  }
}
