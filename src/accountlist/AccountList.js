import React from 'react';
import { View } from 'react-native';
import AccountButton from './AccountButton';

export default class AccountList extends React.PureComponent {

  props: {
    accounts: any[],
    onAccountSelect: () => void,
    onAccountRemove: () => void,
  };

  render() {
    const { accounts, onAccountSelect, onAccountRemove } = this.props;

    return (
      <View>
        {accounts.map((x, i) =>
          <AccountButton
            key={i}
            index={i}
            {...x.toJS()}
            onSelect={onAccountSelect}
            onRemove={onAccountRemove}
          />
        )}
      </View>
    );
  }
}
