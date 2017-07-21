/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import UnreadStreamsContainer from './UnreadStreamsContainer';

export default class UsersScreen extends PureComponent {
  render() {
    return (
      <Screen>
        <UnreadStreamsContainer />
      </Screen>
    );
  }
}
