import React from 'react';
import { View } from 'react-native';
import AccountButton from './AccountButton';

export default class AccountList extends React.PureComponent {

  props: {
    accounts: any[],
  };

  render() {
    const { accounts } = this.props;

    return (
      <View>
        {accounts.map((x, i) =>
          <AccountButton key={i} {...x} />
        )}
      </View>
    );
  }
}
