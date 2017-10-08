/* @flow */
import React, { PureComponent } from 'react';

import { checkCompatibility } from '../api';
import CompatibilityScreen from '../start/CompatibilityScreen';

type Props = {};

type State = {
  compatibilityCheckFail: boolean,
};

export default class CompatibilityChecker extends PureComponent<Props, State> {
  props: Props;

  state: State;

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
