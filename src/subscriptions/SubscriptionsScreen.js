/* @flow strict-local */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import StreamListCard from './StreamListCard';

export default class SubscriptionsScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen search title="Subscriptions">
        <StreamListCard />
      </Screen>
    );
  }
}
