/* @flow strict-local */

import React from 'react';
import { View } from 'react-native';
import Color from 'color';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Narrow, EditMessage } from '../types';
import { LoadingBanner } from '../common';
import { useSelector } from '../react-redux';
import { BRAND_COLOR, NAVBAR_SIZE } from '../styles';
import Title from '../title/Title';
import NavBarBackButton from './NavBarBackButton';
import { getTitleBackgroundColor } from '../title/titleSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { ExtraButton, InfoButton } from '../title-buttons/titleButtonFromNarrow';

type Props = $ReadOnly<{|
  narrow: Narrow,
  editMessage: EditMessage | null,
|}>;

export default function ChatNavBar(props: Props) {
  const { narrow, editMessage } = props;
  const backgroundColor = useSelector(state => getTitleBackgroundColor(state, narrow));
  const color =
    backgroundColor === undefined ? BRAND_COLOR : foregroundColorFromBackground(backgroundColor);
  const spinnerColor =
    backgroundColor === undefined ? 'default' : foregroundColorFromBackground(backgroundColor);

  return (
    <SafeAreaView
      mode="padding"
      edges={['top', 'right', 'left']}
      style={{
        borderColor:
          backgroundColor === undefined
            ? 'hsla(0, 0%, 50%, 0.25)'
            : Color(backgroundColor).darken(0.1),
        borderBottomWidth: 1,
        backgroundColor,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          height: NAVBAR_SIZE,
          alignItems: 'center',
        }}
      >
        <NavBarBackButton color={color} />
        <Title color={color} narrow={narrow} editMessage={editMessage} />
        <ExtraButton color={color} narrow={narrow} />
        <InfoButton color={color} narrow={narrow} />
      </View>
      <LoadingBanner
        spinnerColor={spinnerColor}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    </SafeAreaView>
  );
}
