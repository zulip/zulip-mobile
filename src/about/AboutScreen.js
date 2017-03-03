import React from 'react';

import { Screen } from '../common';
import About from './About';

export default class AboutScreen extends React.PureComponent {
  render() {
    return (
      <Screen title="About">
        <About {...this.props} />
      </Screen>
    )
  }
}