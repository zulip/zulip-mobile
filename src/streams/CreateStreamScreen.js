/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import EditStreamCard from './EditStreamCard';

export default class CreateStreamScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen title="Create new stream" padding>
        <EditStreamCard />
      </Screen>
    );
  }
}
