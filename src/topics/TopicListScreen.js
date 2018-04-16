/* @flow */
import React, { PureComponent } from 'react';

import connectWithActions from '../connectWithActions';
import { LoadingIndicator, Screen } from '../common';
import { getSession } from '../selectors';
import TopicList from './TopicList';

type Props = {
  isOnline: boolean,
};

class TopicListScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { isOnline } = this.props;

    return (
      <Screen title="Topics" padding>
        {isOnline ? <TopicList /> : <LoadingIndicator size={40} />}
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  isOnline: getSession(state).isOnline,
}))(TopicListScreen);
