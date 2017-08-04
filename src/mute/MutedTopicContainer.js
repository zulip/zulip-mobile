/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import MutedTopicList from './MutedTopicList';
import { getAuth, getMute } from '../selectors';

export default class MutedTopicContainer extends PureComponent {
  render() {
    return <MutedTopicList />;
  }
}
