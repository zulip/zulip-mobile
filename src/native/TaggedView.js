/* @flow */
import React, { PureComponent } from 'react';
import { requireNativeComponent } from 'react-native';

type Props = {
  collapsable: boolean,
  tagID: number,
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
