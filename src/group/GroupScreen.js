/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import GroupContainer from './GroupContainer';

export default class GroupScreen extends PureComponent<void> {
  render() {
    return (
      <Screen title="New group chat">
        <GroupContainer />
      </Screen>
    );
  }
}
