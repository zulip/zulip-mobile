/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import { Screen } from '../common';
import config from '../config';
import InfoItem from './InfoItem';
import connectWithActions from '../connectWithActions';
import { getRealm } from '../selectors';

type Props = {
  pushToken: { token: string, msg: string, result: string },
};

class NotificationDiagScreen extends PureComponent<Props> {
  render() {
    const { pushToken } = this.props;
    const variables = {
      Result: pushToken.result,
      Message: pushToken.msg,
      'Initial notification': JSON.stringify(config.startup.notification),
    };
    return (
      <Screen title="Notification Diagnostics">
        <FlatList
          data={Object.keys(variables)}
          keyExtractor={item => item}
          renderItem={({ item }) => <InfoItem label={item} value={variables[item]} />}
        />
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  pushToken: getRealm(state).pushToken,
}))(NotificationDiagScreen);
