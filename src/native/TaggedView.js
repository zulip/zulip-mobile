/* @flow */
import React, { PureComponent } from 'react';
import { requireNativeComponent } from 'react-native';

export default class TaggedView extends PureComponent {
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
