/* @flow strict-local */

import React, { useContext } from 'react';
import { View } from 'react-native';
import Color from 'color';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Narrow, EditMessage } from '../types';
import { LoadingBanner, ZulipStatusBar } from '../common';
import { useSelector } from '../react-redux';
import { BRAND_COLOR, NAVBAR_SIZE, ThemeContext } from '../styles';
import Title from '../title/Title';
import NavBarBackButton from './NavBarBackButton';
import { getStreamColorForNarrow } from '../subscriptions/subscriptionSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { ExtraButton, InfoButton } from '../title-buttons/titleButtonFromNarrow';

type Props = $ReadOnly<{|
  narrow: Narrow,
  editMessage: EditMessage | null,
|}>;

export default function ChatNavBar(props: Props) {
  const { narrow, editMessage } = props;
  const streamColor = useSelector(state => getStreamColorForNarrow(state, narrow));
  const color =
    streamColor === undefined ? BRAND_COLOR : foregroundColorFromBackground(streamColor);
  const themeColor = useContext(ThemeContext).color;
  const textColor =
    streamColor === undefined ? themeColor : foregroundColorFromBackground(streamColor);
  const spinnerColor =
    streamColor === undefined ? 'default' : foregroundColorFromBackground(streamColor);

  return (
    <>
      <ZulipStatusBar backgroundColor={streamColor} />
      <SafeAreaView
        mode="padding"
        edges={['top', 'right', 'left']}
        style={{
          borderColor:
            streamColor === undefined
              ? 'hsla(0, 0%, 50%, 0.25)'
              : Color(streamColor)
                  .darken(0.1)
                  .hsl()
                  .string(),
          borderBottomWidth: 1,
          backgroundColor: streamColor,
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
          <Title color={textColor} narrow={narrow} editMessage={editMessage} />
          <ExtraButton color={color} narrow={narrow} />
          <InfoButton color={color} narrow={narrow} />
        </View>
        <LoadingBanner
          spinnerColor={spinnerColor}
          backgroundColor={streamColor}
          textColor={textColor}
        />
      </SafeAreaView>
    </>
  );
}
