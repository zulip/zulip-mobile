import React from 'react';
import { View } from 'react-native';
import AccountButton from './AccountButton';

export default class AccountList extends React.PureComponent {

  props: {
    accounts: any[],
    onAccountSelect: () => void,
  };

  render() {
    const { accounts, onAccountSelect } = this.props;

    return (
      <View>
        {accounts.map((x, i) =>
          <AccountButton key={i} {...x.toJS()} onPress={onAccountSelect} />
        )}
      </View>
    );
  }
}
