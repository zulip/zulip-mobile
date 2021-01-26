/* @flow strict-local */

import React from 'react';
import { View } from 'react-native';
import Color from 'color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Narrow, EditMessage } from '../types';
import { LoadingBanner } from '../common';
import { useSelector } from '../react-redux';
import { BRAND_COLOR, NAVBAR_SIZE } from '../styles';
import Title from '../title/Title';
import NavBarBackButton from './NavBarBackButton';
import { DEFAULT_TITLE_BACKGROUND_COLOR, getTitleBackgroundColor } from '../title/titleSelectors';
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
    backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR
      ? BRAND_COLOR
      : foregroundColorFromBackground(backgroundColor);
  const spinnerColor =
    backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR
      ? 'default'
      : foregroundColorFromBackground(backgroundColor);

  const insets = useSafeAreaInsets();

  return (
    <>
      <View
        style={{
          height: insets.top,
          backgroundColor,
        }}
      />
      <View
        style={{
          borderColor:
            backgroundColor === 'transparent'
              ? 'hsla(0, 0%, 50%, 0.25)'
              : Color(backgroundColor).darken(0.1),
          borderBottomWidth: 1,
        }}
      >
        <View
          style={[
            {
              flexDirection: 'row',
              height: NAVBAR_SIZE,
              alignItems: 'center',
            },
            { backgroundColor },
          ]}
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
      </View>
    </>
  );
}
