/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node, ComponentType } from 'react';
import { View } from 'react-native';
// $FlowFixMe[untyped-import]
import Color from 'color';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Narrow, EditMessage } from '../types';
import { LoadingBanner, ZulipStatusBar } from '../common';
import { useSelector, useDispatch } from '../react-redux';
import { BRAND_COLOR, NAVBAR_SIZE, ThemeContext } from '../styles';
import Title from '../title/Title';
import NavBarBackButton from './NavBarBackButton';
import { getStreamColorForNarrow } from '../subscriptions/subscriptionSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { caseNarrowDefault, streamIdOfNarrow, streamNarrow } from '../utils/narrow';
import {
  navigateToStream,
  navigateToAccountDetails,
  navigateToPmConversationDetails,
  navigateToTopicList,
  doNarrow,
} from '../actions';
import * as NavigationService from './NavigationService';
import { isNarrowValid as getIsNarrowValid } from '../selectors';
import NavButton from './NavButton';

function ExtraNavButtonStream(props): Node {
  const { color, narrow } = props;

  const isNarrowValid = useSelector(state => getIsNarrowValid(state, narrow));
  if (!isNarrowValid) {
    return null;
  }

  return (
    <NavButton
      name="list"
      color={color}
      onPress={() => {
        NavigationService.dispatch(navigateToTopicList(streamIdOfNarrow(narrow)));
      }}
    />
  );
}

function ExtraNavButtonTopic(props): Node {
  const { narrow, color } = props;
  const dispatch = useDispatch();

  const handlePress = useCallback(() => {
    dispatch(doNarrow(streamNarrow(streamIdOfNarrow(narrow))));
  }, [dispatch, narrow]);

  return <NavButton name="arrow-up" color={color} onPress={handlePress} />;
}

function InfoNavButtonStream(props): Node {
  const { color, narrow } = props;

  const isNarrowValid = useSelector(state => getIsNarrowValid(state, narrow));
  if (!isNarrowValid) {
    return null;
  }

  return (
    <NavButton
      name="info"
      color={color}
      onPress={() => {
        NavigationService.dispatch(navigateToStream(streamIdOfNarrow(narrow)));
      }}
    />
  );
}

function InfoNavButtonPrivate(props): Node {
  const { color, userId } = props;
  return (
    <NavButton
      name="info"
      color={color}
      onPress={() => {
        NavigationService.dispatch(navigateToAccountDetails(userId));
      }}
    />
  );
}

function InfoNavButtonGroup(props): Node {
  const { color, userIds } = props;
  return (
    <NavButton
      name="info"
      color={color}
      onPress={() => {
        NavigationService.dispatch(navigateToPmConversationDetails(userIds));
      }}
    />
  );
}

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
      stream: () => (
        <>
          <ExtraNavButtonStream {...props} />
          <InfoNavButtonStream {...props} />
        </>
      ),
      topic: () => (
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
        {/* This View is the app bar:
            https://material.io/components/app-bars-top#specs */}
        <View
          style={{
            // Ideally this would be `minHeight`, like in our other app bars,
            // to smoothly accommodate large font sizes.  But we seem to have
            // a layout bug where doing that causes the app bar to take up
            // over half the screen:
            //   https://github.com/zulip/zulip-mobile/pull/5035#discussion_r724700752
            height: NAVBAR_SIZE,
            paddingHorizontal: 4,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <NavBarBackButton color={buttonColor} />
          {/* We put 20px here to get 32px total between the icon and the title text. */}
          <View style={{ width: 20 }} />
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
