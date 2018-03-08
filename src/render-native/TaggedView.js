/* @flow */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { requireNativeComponent } from 'react-native';

type Props = {
  children: ChildrenArray<any>,
  collapsable: boolean,
  tagID: number | string, // TODO types: pick one
};

export default class TaggedView extends PureComponent<Props> {
  props: Props;

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
