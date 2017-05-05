import React from 'react';

import { Screen, } from '../common';
import AboutScreen from './AboutScreen';

export default class AboutStart extends React.PureComponent {
  render() {
    return (
      <Screen title="About">
        <AboutScreen {...this.props} />
      </Screen>
    );
  }
}
