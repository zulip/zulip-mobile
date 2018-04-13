/* @flow */
import React, { PureComponent } from 'react';

import { Screen } from '../common';
import EditStreamContainer from './EditStreamContainer';

export default class EditStreamScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen title="Edit stream" padding keyboardShouldPersistTaps="handled">
        <EditStreamContainer />
      </Screen>
    );
  }
}
