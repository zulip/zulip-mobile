/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { nativeApplicationVersion } from 'expo-application';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector, useGlobalSelector, useDispatch } from '../react-redux';
import { getGlobalSettings } from '../selectors';
import NestedNavRow from '../common/NestedNavRow';
import InputRowRadioButtons from '../common/InputRowRadioButtons';
import SwitchRow from '../common/SwitchRow';
import Screen from '../common/Screen';
import {
  IconNotifications,
  IconLanguage,
  IconMoreHorizontal,
  IconSmartphone,
  IconServer,
  IconAlertTriangle,
} from '../common/Icons';
import { setGlobalSettings } from '../actions';
import { shouldUseInAppBrowser } from '../utils/openLink';
import TextRow from '../common/TextRow';
import { getIdentity, getServerVersion } from '../account/accountsSelectors';
import { kMinSupportedVersion } from '../common/ServerCompatBanner';
import { kWarningColor } from '../styles/constants';
import { showErrorAlert } from '../utils/info';
import { TranslationContext } from '../boot/TranslationProvider';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'settings'>,
  route: RouteProp<'settings', void>,
|}>;

export default function SettingsScreen(props: Props): Node {
  const theme = useGlobalSelector(state => getGlobalSettings(state).theme);
  const browser = useGlobalSelector(state => getGlobalSettings(state).browser);
  const globalSettings = useGlobalSelector(getGlobalSettings);
  const markMessagesReadOnScroll = globalSettings.markMessagesReadOnScroll;

  const zulipVersion = useSelector(getServerVersion);
  const identity = useSelector(getIdentity);

  const dispatch = useDispatch();
  const _ = React.useContext(TranslationContext);

  const { navigation } = props;

  const handleThemeChange = useCallback(() => {
    dispatch(setGlobalSettings({ theme: theme === 'default' ? 'night' : 'default' }));
  }, [theme, dispatch]);

  return (
    <Screen title="Settings">
      <SwitchRow label="Night mode" value={theme === 'night'} onValueChange={handleThemeChange} />
      <SwitchRow
        label="Open links with in-app browser"
        value={shouldUseInAppBrowser(browser)}
        onValueChange={value => {
          dispatch(setGlobalSettings({ browser: value ? 'embedded' : 'external' }));
        }}
      />
      <InputRowRadioButtons
        navigation={navigation}
        label="Mark messages as read on scroll"
        description="When scrolling through messages, should they automatically be marked as read?"
        valueKey={markMessagesReadOnScroll}
        items={[
          { key: 'always', title: 'Always' },
          { key: 'never', title: 'Never' },
          {
            key: 'conversation-views-only',
            title: 'Only in conversation views',
            subtitle:
              'Messages will be automatically marked as read only when viewing a single topic or private message conversation.',
          },
        ]}
        onValueChange={value => {
          dispatch(setGlobalSettings({ markMessagesReadOnScroll: value }));
        }}
      />
      <NestedNavRow
        icon={{ Component: IconNotifications }}
        title="Notifications"
        onPress={() => {
          navigation.push('notifications');
        }}
      />
      <NestedNavRow
        icon={{ Component: IconLanguage }}
        title="Language"
        onPress={() => {
          navigation.push('language');
        }}
      />
      <NestedNavRow
        icon={{ Component: IconMoreHorizontal }}
        title="Legal"
        onPress={() => {
          navigation.push('legal');
        }}
      />
      <TextRow
        icon={{ Component: IconSmartphone }}
        title="App version"
        subtitle={{ text: '{_}', values: { _: `v${nativeApplicationVersion ?? '?.?.?'}` } }}
      />
      <TextRow
        icon={{ Component: IconServer }}
        title="Server version"
        subtitle={{ text: '{_}', values: { _: zulipVersion.raw() } }}
        {...(!zulipVersion.isAtLeast(kMinSupportedVersion) && {
          icon: { Component: IconAlertTriangle, color: kWarningColor },
          onPress: () => {
            showErrorAlert(
              'Server not supported',
              _({
                text: '{realm} is running Zulip Server {version}, which is unsupported. The minimum supported version is Zulip Server {minSupportedVersion}.',
                values: {
                  realm: identity.realm.toString(),
                  version: zulipVersion.raw(),
                  minSupportedVersion: kMinSupportedVersion.raw(),
                },
              }),
              {
                url: new URL(
                  // TODO: Instead, link to new Help Center doc once we have it:
                  //   https://github.com/zulip/zulip/issues/23842
                  'https://zulip.readthedocs.io/en/stable/overview/release-lifecycle.html#compatibility-and-upgrading',
                ),
                globalSettings,
              },
            );
          },
        })}
      />
    </Screen>
  );
}
