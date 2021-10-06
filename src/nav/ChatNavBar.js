/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node, ComponentType } from 'react';
import { View } from 'react-native';
// $FlowFixMe[untyped-import]
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
import { caseNarrowDefault } from '../utils/narrow';
import InfoNavButtonStream from '../title-buttons/InfoNavButtonStream';
import InfoNavButtonPrivate from '../title-buttons/InfoNavButtonPrivate';
import InfoNavButtonGroup from '../title-buttons/InfoNavButtonGroup';
import ExtraNavButtonStream from '../title-buttons/ExtraNavButtonStream';
import ExtraNavButtonTopic from '../title-buttons/ExtraNavButtonTopic';

/**
 * The "action items" to include in this app bar.
 *
 * I.e., the buttons at the end of the app bar.  The spec calls these
 * "action items":
 *   https://material.io/components/app-bars-top#anatomy
 */
const ActionItems: ComponentType<{| +color: string, +narrow: Narrow |}> = props =>
  caseNarrowDefault(
    props.narrow,
    {
      stream: streamName => (
        <>
          <ExtraNavButtonStream {...props} />
          <InfoNavButtonStream {...props} />
        </>
      ),
      topic: (streamName, topic) => (
        <>
          <ExtraNavButtonTopic {...props} />
          <InfoNavButtonStream {...props} />
        </>
      ),
      pm: ids =>
        ids.length === 1 ? (
          <InfoNavButtonPrivate userId={ids[0]} color={props.color} />
        ) : (
          <InfoNavButtonGroup userIds={ids} color={props.color} />
        ),
    },
    () => false,
  );

export default function ChatNavBar(props: {|
  +narrow: Narrow,
  +editMessage: EditMessage | null,
|}): Node {
  const { narrow, editMessage } = props;
  const streamColor = useSelector(state => getStreamColorForNarrow(state, narrow));
  const buttonColor =
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
            // Ideally this would be `minHeight`, like in our other app bars,
            // to smoothly accommodate large font sizes.  But we seem to have
            // a layout bug where doing that causes the app bar to take up
            // over half the screen:
            //   https://github.com/zulip/zulip-mobile/pull/5035#discussion_r724700752
            height: NAVBAR_SIZE,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <NavBarBackButton color={buttonColor} />
          <Title color={textColor} narrow={narrow} editMessage={editMessage} />
          <ActionItems color={buttonColor} narrow={narrow} />
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
