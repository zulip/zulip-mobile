/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import { Screen } from '../common';
import InfoItem from './InfoItem';
import connectWithActions from '../connectWithActions';

type Props = {
  pushToken: { token: string, msg: string, result: string },
  initialNotification: {},
};

class NotificationDiagScreen extends PureComponent<Props> {
  render() {
    const { pushToken, initialNotification } = this.props;
    const variables = {
      Result: pushToken.result,
      Message: pushToken.msg,
      'Initial notification': JSON.stringify(initialNotification),
    };
    return (
      <Screen title="Notification Diagnostics" padding>
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
  pushToken: state.realm.pushToken,
  initialNotification: state.app.debug.initialNotification,
}))(NotificationDiagScreen);
