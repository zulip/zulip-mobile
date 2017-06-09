import React from 'react';

import { Screen } from '../common';
import TabLayout from './TabLayout';

export default class PrivateMessages extends React.Component {
  render() {
    return (
      <Screen title="Share with">
        <TabLayout {...this.props} />
      </Screen>
    );
  }
}
