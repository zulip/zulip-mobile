/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import config from '../config';
import { Screen } from '../common';
import InfoItem from './InfoItem';

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<NavigationStateRoute>,
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
