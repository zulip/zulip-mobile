//* @flow strict-local */
import React from 'react';
import { Pressable } from 'react-native';
import { Icon } from '../common/Icons';

type Props = $ReadOnly<{|
  iconName: 'play' | 'pause',
  onPressBack: () => void,
|}>;

export default function VideoPlayerIcone(props: Props) {
  const { onPressBack, iconName } = props;
  return (
    <Pressable onPress={onPressBack} hitSlop={12}>
      {({ pressed }) => <Icon size={48} color={pressed ? 'gray' : 'white'} name={iconName} />}
    </Pressable>
  );
}
