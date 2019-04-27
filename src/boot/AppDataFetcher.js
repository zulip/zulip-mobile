/* @flow strict-local */

import { PureComponent } from 'react';

import type { Node as React$Node } from 'react';
import type { InjectedDispatch } from '../types';
import { connect } from '../react-redux';
import { getSession } from '../directSelectors';
import { doInitialFetch } from '../actions';

type OwnProps = {|
  children: React$Node,
|};

type SelectorProps = {|
  needsInitialFetch: boolean,
|};

type Props = {|
  ...InjectedDispatch,
  ...OwnProps,
  ...SelectorProps,
|};

class AppDataFetcher extends PureComponent<Props> {
  componentDidUpdate = () => {
    const { dispatch, needsInitialFetch } = this.props;

    if (needsInitialFetch) {
      dispatch(doInitialFetch());
    }
  };

  render() {
    return this.props.children;
  }
}

export default connect(state => ({
  needsInitialFetch: getSession(state).needsInitialFetch,
}))(AppDataFetcher);
