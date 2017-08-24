/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import UnreadCardsListContainer from './UnreadCardsListContainer';

export default class UnreadCardsScreen extends PureComponent {
  render() {
    return (
      <Screen title="Unread Messages">
        <UnreadCardsListContainer />
      </Screen>
    );
  }
}
