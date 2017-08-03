/* @flow */
import React, { PureComponent } from 'react';

import SearchScreen from '../search/SearchScreen';
import SubscriptionsContainer from './SubscriptionsContainer';

export default class SubscriptionsScreen extends PureComponent {
  render() {
    return (
      <SearchScreen title="Subscriptions">
        <SubscriptionsContainer />
      </SearchScreen>
    );
  }
}
