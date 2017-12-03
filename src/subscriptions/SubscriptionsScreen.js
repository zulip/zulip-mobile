/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import StreamListContainer from './StreamListContainer';

export default class SubscriptionsScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen search title="Subscriptions">
        <StreamListContainer />
      </Screen>
    );
  }
}
