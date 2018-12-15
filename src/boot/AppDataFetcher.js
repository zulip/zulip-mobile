/* @flow strict-local */
import { connect } from 'react-redux';

import { PureComponent } from 'react';

import type { ChildrenArray, Dispatch, GlobalState } from '../types';
import { getSession } from '../directSelectors';
import { doInitialFetch } from '../actions';

type Props = {|
  needsInitialFetch: boolean,
  dispatch: Dispatch,
  children: ChildrenArray<*>,
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

export default connect((state: GlobalState) => ({
  needsInitialFetch: getSession(state).needsInitialFetch,
}))(AppDataFetcher);
