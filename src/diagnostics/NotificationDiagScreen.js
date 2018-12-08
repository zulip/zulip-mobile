/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { GlobalState } from '../types';
import { Screen } from '../common';
import config from '../config';
import InfoItem from './InfoItem';
import { getRealm } from '../selectors';

type Props = {
  pushToken: { token: string, msg: string, result: string },
};

class NotificationDiagScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { pushToken } = this.props;
    const variables = {
      Result: pushToken.result,
      Message: pushToken.msg,
      'Initial notification': JSON.stringify(config.startup.notification),
    };
    return (
      <Screen title="Notification Diagnostics" scrollEnabled={false}>
        <FlatList
          data={Object.keys(variables)}
          keyExtractor={item => item}
          renderItem={({ item }) => <InfoItem label={item} value={variables[item]} />}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  pushToken: getRealm(state).pushToken,
}))(NotificationDiagScreen);
