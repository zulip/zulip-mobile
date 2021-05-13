/* @flow strict-local */
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { IconPlus, IconDone } from './Icons';
import { BRAND_COLOR } from '../styles';

type Props = $ReadOnly<{|
  isSubscribed: boolean,
  disabled: boolean,
  onPress: (arg: boolean) => void,
|}>;

export default function ZulipSubscribe(props: Props) {
  const [getSubscribed, setSubscribed] = useState(props.isSubscribed);
  const { disabled, onPress } = props;

  const onIconPress = () => {
    onPress(!getSubscribed);
    setSubscribed(!getSubscribed);
  };

  return (
    <Pressable
      onPress={onIconPress}
      disabled={disabled}
      style={{ marginLeft: 12 }}
      hitSlop={{
        bottom: 5,
        left: 10,
        right: 12,
        top: 5,
      }}
    >
      {getSubscribed ? (
        <IconDone size={24} color={BRAND_COLOR} />
      ) : (
        <IconPlus size={24} color="hsla(0,0%,50%,0.5)" />
      )}
    </Pressable>
  );
}
