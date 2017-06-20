/* @flow */
import { ScrollView, requireNativeComponent } from 'react-native';

const NativeAnchorScrollView = requireNativeComponent('AnchorScrollView', null);

export default class AnchorScrollView extends ScrollView {
  render() {
    const scrollView = super.render();
    return { ...scrollView, type: NativeAnchorScrollView };
  }
}
