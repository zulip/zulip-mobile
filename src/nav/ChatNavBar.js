/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node, ComponentType } from 'react';
import { View } from 'react-native';
// $FlowFixMe[untyped-import]
import Color from 'color';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Narrow, EditMessage, UserId } from '../types';
import type { PmKeyRecipients } from '../utils/recipient';
import LoadingBanner from '../common/LoadingBanner';
import ZulipStatusBar from '../common/ZulipStatusBar';
import { useSelector, useDispatch } from '../react-redux';
import { BRAND_COLOR, NAVBAR_SIZE, ThemeContext } from '../styles';
import Title from '../title/Title';
import NavBarBackButton from './NavBarBackButton';
import { getStreamColorForNarrow } from '../subscriptions/subscriptionSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { caseNarrowDefault, streamIdOfNarrow, streamNarrow } from '../utils/narrow';
import { doNarrow } from '../actions';
import { isNarrowValid as getIsNarrowValid } from '../selectors';
import NavButton from './NavButton';
import { useNavigation } from '../react-navigation';
import { OfflineNoticePlaceholder } from '../boot/OfflineNoticeProvider';

function ExtraNavButtonStream(props: {| +color: string, +narrow: Narrow |}): Node {
  const { color, narrow } = props;
  const navigation = useNavigation();

  const isNarrowValid = useSelector(state => getIsNarrowValid(state, narrow));
  if (!isNarrowValid) {
    return null;
  }

  return (
    <NavButton
      name="list"
      color={color}
      onPress={() => {
        navigation.push('topic-list', { streamId: streamIdOfNarrow(narrow) });
      }}
    />
  );
}

function ExtraNavButtonTopic(props: {| +color: string, +narrow: Narrow |}): Node {
  const { narrow, color } = props;
  const dispatch = useDispatch();

  const handlePress = useCallback(() => {
    dispatch(doNarrow(streamNarrow(streamIdOfNarrow(narrow))));
  }, [dispatch, narrow]);

  return <NavButton name="arrow-up" color={color} onPress={handlePress} />;
}

function InfoNavButtonStream(props: {| +color: string, +narrow: Narrow |}): Node {
  const { color, narrow } = props;
  const navigation = useNavigation();

  const isNarrowValid = useSelector(state => getIsNarrowValid(state, narrow));
  if (!isNarrowValid) {
    return null;
  }

  return (
    <NavButton
      name="info"
      color={color}
      onPress={() => {
        navigation.push('stream-settings', { streamId: streamIdOfNarrow(narrow) });
      }}
    />
  );
}

function InfoNavButtonPrivate(props: {| +color: string, +userId: UserId |}): Node {
  const { color, userId } = props;
  const navigation = useNavigation();
  return (
    <NavButton
      name="info"
      color={color}
      onPress={() => {
        navigation.push('account-details', { userId });
      }}
    />
  );
}

function InfoNavButtonGroup(props: {| +color: string, +userIds: PmKeyRecipients |}): Node {
  const { color, userIds } = props;
  const navigation = useNavigation();
  return (
    <NavButton
      name="info"
      color={color}
      onPress={() => {
        navigation.push('pm-conversation-details', { recipients: userIds });
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
        edges={['top']}
        style={{
          borderColor:
            streamColor === undefined
              ? 'hsla(0, 0%, 50%, 0.25)'
              : Color(streamColor).darken(0.1).hsl().string(),
          borderBottomWidth: 1,
          backgroundColor: streamColor,
        }}
      >
        <OfflineNoticePlaceholder />
        {/* This SafeAreaView is the app bar:
            https://material.io/components/app-bars-top#specs */}
        <SafeAreaView
          mode="padding"
          edges={['right', 'left']}
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
        </SafeAreaView>

        <LoadingBanner
          spinnerColor={spinnerColor}
          backgroundColor={streamColor}
          textColor={textColor}
        />
      </SafeAreaView>
    </>
  );
}
