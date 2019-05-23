/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';

import type { Node as React$Node } from 'react';
import type { GlobalState } from '../types';
import store, { restore } from './store';
import timing from '../utils/timing';
import { sentrySetUsername } from '../sentry';

type Props = {|
  children: React$Node,
|};

export default class StoreHydrator extends PureComponent<Props> {
  componentDidMount() {
    timing.start('Store hydration');
    restore((err?: Error, state?: GlobalState) => {
      timing.end('Store hydration');
      if (state) {
        sentrySetUsername(state.settings.diagnosticNickname);
      }
    });
  }

  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}
