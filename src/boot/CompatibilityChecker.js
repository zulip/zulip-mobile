/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { Node as React$Node } from 'react';
import { checkCompatibility } from '../api';
import CompatibilityScreen from '../start/CompatibilityScreen';

type Props = {|
  children: React$Node,
|};

type State = {|
  compatibilityCheckFail: boolean,
|};

export default class CompatibilityChecker extends PureComponent<Props, State> {
  state = {
    compatibilityCheckFail: false,
  };

  componentDidMount() {
    checkCompatibility().then(res => {
      if (res.status === 400) {
        this.setState({
          compatibilityCheckFail: true,
        });
      }
    });
  }

  render() {
    const { compatibilityCheckFail } = this.state;

    return compatibilityCheckFail ? <CompatibilityScreen /> : this.props.children;
  }
}
