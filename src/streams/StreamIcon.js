/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { IconStream, IconPrivate, IconWebPublic } from '../common/Icons';

type Props = $ReadOnly<{|
  color?: string,
  isPrivate: boolean,
  isMuted: boolean,
  isWebPublic: boolean | void,
  size: number,
  style?: TextStyleProp,
|}>;

export default function StreamIcon(props: Props): Node {
  const { color, style, isPrivate, isWebPublic, size } = props;

  let Component = undefined;

  if (isPrivate) {
    Component = IconPrivate;
  } else if (isWebPublic ?? false) {
    Component = IconWebPublic;
  } else {
    Component = IconStream;
  }

  return <Component size={size} color={color} style={style} />;
}
