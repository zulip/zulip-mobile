/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { addNavigationHelpers } from 'react-navigation';
import { createReduxBoundAddListener } from 'react-navigation-redux-helpers';

import type { Dispatch, GlobalState, NavigationState, PlainDispatch } from '../types';
import { getNav } from '../selectors';
import AppNavigator from './AppNavigator';

type StateProps = {|
  dispatch: Dispatch,
  nav: NavigationState,
|};

type Props = {|
  ...StateProps,
|};

class AppWithNavigation extends PureComponent<Props> {
  render() {
    const { nav } = this.props;
    const dispatch = (this.props.dispatch: PlainDispatch);
    const addListener = createReduxBoundAddListener('root');

    return (
      // $FlowFixMe-56 flow-typed object type is incompatible with statics of React.Component
      <AppNavigator
        navigation={addNavigationHelpers({
          state: nav,
          // $FlowFixMe flow-typed says react-navigation expects `dispatch` to return boolean
          dispatch,
          addListener,
        })}
      />
    );
  }
}

export default connect((state: GlobalState) => ({
  nav: getNav(state),
}))(AppWithNavigation);
