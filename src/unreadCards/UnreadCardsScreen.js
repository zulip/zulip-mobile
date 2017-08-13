/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import UnreadCardsList from './UnreadCardsList';
// import UnreadCardsContainer from './UnreadCardsContainer';

export default class UnreadCardsScreen extends PureComponent {
  render() {
    return (
      <Screen title="Unread Messages">
        <UnreadCardsList />
      </Screen>
    );
  }
}
