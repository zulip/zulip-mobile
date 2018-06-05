/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import EditStreamCard from './EditStreamCard';

export default class EditStreamScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen title="Edit stream" padding>
        <EditStreamCard />
      </Screen>
    );
  }
}
