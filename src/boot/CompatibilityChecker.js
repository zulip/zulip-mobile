/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';

import * as api from '../api';
import CompatibilityScreen from '../start/CompatibilityScreen';

type Props = $ReadOnly<{|
  children: Node,
|}>;

type State = {|
  compatibilityCheckFail: boolean,
|};

export default class CompatibilityChecker extends PureComponent<Props, State> {
  state: State = {
    compatibilityCheckFail: false,
  };

  componentDidMount() {
    api.checkCompatibility().then(res => {
      if (res.status === 400) {
        this.setState({
          compatibilityCheckFail: true,
        });
      }
    });
  }

  render(): Node {
    const { compatibilityCheckFail } = this.state;

    return compatibilityCheckFail ? <CompatibilityScreen /> : this.props.children;
  }
}
