/* @flow strict-local */
import type AnimatedValue from 'react-native/Libraries/Animated/nodes/AnimatedValue';
import type { DimensionValue } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { IsSupertype } from '../generics';
import type { ViewStylePropWithout } from '../reactNativeUtils';

function test_ViewStylePropWithout() {
  type ViewStyleNoHeight = ViewStylePropWithout<{|
    height: DimensionValue,
    minHeight: DimensionValue,
    maxHeight: DimensionValue,
  |}>;

  // Is a subtype of ViewStyleProp
  (s: ViewStyleNoHeight): ViewStyleProp => s;

  // Accepts width-related attributes
  (s: {| minWidth: 10, width: AnimatedValue, maxWidth: '100%' |}): ViewStyleNoHeight => s;

  // Doesn't accept height-related attributes
  // $FlowExpectedError[incompatible-return]
  (s: {| minHeight: 10 |}): ViewStyleNoHeight => s;
  // $FlowExpectedError[incompatible-return]
  (s: {| height: AnimatedValue |}): ViewStyleNoHeight => s;
  // $FlowExpectedError[incompatible-return]
  (s: {| maxHeight: '100%' |}): ViewStyleNoHeight => s;
}
