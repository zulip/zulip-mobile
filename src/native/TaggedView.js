import React from 'react';
import { requireNativeComponent } from 'react-native';

export default class TaggedView extends React.Component {
  render() {
    return (
      <NativeTaggedView {...this.props}>
        {this.props.children}
      </NativeTaggedView>
    );
  }
}

const NativeTaggedView = requireNativeComponent('TaggedView', null);
