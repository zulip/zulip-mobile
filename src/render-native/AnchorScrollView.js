/* @flow */
import { ScrollView, requireNativeComponent } from 'react-native';

const NativeAnchorScrollView = requireNativeComponent('AnchorScrollView', null);

export default class AnchorScrollView extends ScrollView {
  render() {
    return { ...super.render(), type: NativeAnchorScrollView };
  }
}
