/* @flow */
import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

export default class UnreadCards extends PureComponent<Props> {
  render() {
    const { unreadStreamsAndTopics, ...restProps } = this.props;
    const unreadCards = { [{data: }, {}]};
    return <SectionList />;
  }
}
