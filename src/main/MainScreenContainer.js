/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';

import type { Actions, Message, Narrow } from '../types';
import boundActions from '../boundActions';
import { getShownMessagesInActiveNarrow } from '../selectors';
// import MainScreen from './MainScreenWithDrawers';
// import MainScreen from './MainScreenWithTabs';
import MainScreen from './MainScreenWithModalNavigation';

class MainScreenContainer extends PureComponent {
  props: {
    narrow: Narrow,
    actions: Actions,
    messages: Message[],
  };

  componentWillReceiveProps(nextProps) {
    const { actions, narrow } = this.props;
    if (!isEqual(narrow, nextProps.narrow) && nextProps.messages.length === 0) {
      actions.fetchMessagesAtFirstUnread(nextProps.narrow);
    }
  }

  render() {
    return <MainScreen />;
  }
}

export default connect(
  state => ({
    narrow: state.chat.narrow,
    messages: getShownMessagesInActiveNarrow(state),
  }),
  boundActions,
)(MainScreenContainer);
