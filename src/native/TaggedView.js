/* @flow */
import React from 'react';
import { requireNativeComponent } from 'react-native';

export default class TaggedView extends React.PureComponent {
  render() {
    const { collapsable, tagID } = this.props;
    return (
      <NativeTaggedView tagID={tagID} collapsable={collapsable}>
        {this.props.children}
      </NativeTaggedView>
    );
  }
}

const NativeTaggedView = requireNativeComponent('TaggedView', null);
