/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { AppNavigationProp } from '../nav/AppNavigator';
import config from '../config';
import { Screen } from '../common';
import InfoItem from './InfoItem';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'variables'>,
|}>;

export default class VariablesScreen extends PureComponent<Props> {
  render() {
    const variables = {
      enableReduxLogging: config.enableReduxLogging,
      enableReduxSlowReducerWarnings: config.enableReduxSlowReducerWarnings,
      'process.env.NODE_ENV': process.env.NODE_ENV ?? '(not defined)',
      'global.btoa': !!global.btoa,
    };

    return (
      <Screen title="Variables" scrollEnabled={false}>
        <FlatList
          data={Object.keys(variables)}
          keyExtractor={item => item}
          renderItem={({ item }) => <InfoItem label={item} value={variables[item]} />}
        />
      </Screen>
    );
  }
}
