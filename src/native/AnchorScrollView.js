import React from 'react';
import { ScrollView, requireNativeComponent } from 'react-native';

export default class AnchorScrollView extends ScrollView {
  render() {
    const scrollView = super.render();
    return { ...scrollView, type: NativeAnchorScrollView };
  }
}

const NativeAnchorScrollView = requireNativeComponent('AnchorScrollView', null);
