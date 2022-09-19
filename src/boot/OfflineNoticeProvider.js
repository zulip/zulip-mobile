// @flow strict-local
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
import type { DimensionValue } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import * as logging from '../utils/logging';
import { useGlobalSelector } from '../react-redux';
import { getGlobalSession, getGlobalSettings } from '../directSelectors';
import { useHasStayedTrueForMs } from '../reactUtils';
import type { JSONableDict } from '../utils/jsonable';
import { createStyleSheet } from '../styles';
import ZulipTextIntl from '../common/ZulipTextIntl';
import type { ViewStylePropWithout } from '../reactNativeUtils';
import ZulipStatusBar from '../common/ZulipStatusBar';
import type { ThemeName } from '../reduxTypes';

function useShouldShowUncertaintyNotice(): boolean {
  const isOnline = useGlobalSelector(state => getGlobalSession(state).isOnline);

  const result = useHasStayedTrueForMs(
    // See note in `SessionState` for what this means.
    isOnline === null,

    // A decently long time, much longer than it takes to send `true` or
    // `false` over the RN bridge.
    //
    // Also, one second longer than what we set for
    // `reachabilityRequestTimeout` in NetInfo's config (15s), which is the
    // longest `isOnline` can be `null` on iOS in an expected case. For
    // details, see the comment where we dispatch the action to change
    // `isOnline`.
    //
    // If this time passes and `isOnline` is still `null`, we should treat
    // it as a bug and investigate.
    16 * 1000,
  );

  useEffect(() => {
    if (result) {
      NetInfo.fetch().then(state => {
        logging.warn(
          'Failed to determine Internet reachability in a reasonable time',
          // `state`, being inexact, might have unknown properties that
          // aren't JSONable. Hopefully Sentry would just drop parts that
          // aren't JSONable instead of panicking or dropping everything.
          // $FlowFixMe[incompatible-cast]
          (state: JSONableDict),
        );
      });
    }
  }, [result]);

  return result;
}

const OfflineNoticeContext = React.createContext({
  isNoticeVisible: false,
  noticeContentAreaHeight: 0,
});

type ProviderProps = {|
  +children: Node,
|};

const backgroundColorForTheme = (theme: ThemeName): string =>
  // TODO(redesign): Choose these more intentionally; these are just the
  //   semitransparent HALF_COLOR flattened with themeData.backgroundColor.
  //   See https://github.com/zulip/zulip-mobile/pull/5491#issuecomment-1282859332
  theme === 'default' ? '#bfbfbf' : '#50565e';

/**
 * Shows a notice if the app is working in offline mode.
 *
 * Shows a different notice if we've taken longer than we expect to
 * determine Internet reachability. IOW, if the user sees this, there's a
 * bug.
 *
 * Shows nothing if the Internet is reachable.
 *
 * The notice is a banner at the top of the screen. All screens should
 * render a OfflineNoticePlaceholder so that banner doesn't hide any of the
 * screen's content; see there for details.
 */
export function OfflineNoticeProvider(props: ProviderProps): Node {
  const theme = useGlobalSelector(state => getGlobalSettings(state).theme);
  const isOnline = useGlobalSelector(state => getGlobalSession(state).isOnline);
  const shouldShowUncertaintyNotice = useShouldShowUncertaintyNotice();
  const isNoticeVisible = isOnline === false || shouldShowUncertaintyNotice;

  const styles = useMemo(
    () =>
      createStyleSheet({
        flex1: { flex: 1 },
        noticeSurface: {
          position: 'absolute',

          // Whether the notice is visible or tucked away above the window.
          ...(isNoticeVisible ? { top: 0 } : { bottom: '100%' }),

          zIndex: 1,
          width: '100%',

          // If changing, also change the status bar color in
          // OfflineNoticePlaceholder.
          backgroundColor: backgroundColorForTheme(theme),

          justifyContent: 'center',
          alignItems: 'center',
        },
        noticeContentArea: {
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 4,
        },
        noticeText: { fontSize: 14 },
      }),
    [isNoticeVisible, theme],
  );

  /**
   *  Our best guess at the computed height of the content area in the
   *    layout caused by this render.
   *
   * Pass this to OfflineNoticePlaceholder so it reserves the right amount
   * of height for the notice when the notice is visible.
   *
   * If wrong, expect OfflineNoticePlaceholder to visibly have the wrong
   * height for a moment but then recover quickly.
   */
  // It's the computed height from the *last* render (or zero if this is the
  // first render), using the onLayout prop. So, to make a good guess, we
  // try to avoid changes to the computed height:
  //   - When the notice is offscreen, we set the text to match the more
  //     likely message when the notice comes onscreen, namely the "offline"
  //     message. That means it'll say "offline" when the state is actually
  //     "online", but that's OK because it'll be offscreen.
  //   - When the notice is onscreen, it'll show either an "offline" message
  //     or an "uncertain" message. It's possible but unlikely that just one
  //     message would wrap onto two lines, inviting errors by 0.5x or 2x.
  //     To keep that possibility in check, we don't make either message
  //     very detailed, so they'd be similar in length in any language, and
  //     hopefully both short enough to stay on one line, even with a
  //     large-ish system font setting.
  const [noticeContentAreaHeight, setNoticeContentAreaHeight] = useState(0);

  const handleNoticeContentAreaLayoutChange = useCallback(event => {
    setNoticeContentAreaHeight(event.nativeEvent.layout.height);
  }, []);

  const contextValue = useMemo(
    () => ({ isNoticeVisible, noticeContentAreaHeight }),
    [isNoticeVisible, noticeContentAreaHeight],
  );

  return (
    <View style={styles.flex1}>
      <SafeAreaView
        mode="padding"
        edges={['top', 'right', 'left']}
        style={styles.noticeSurface}
        {
          // Just as we do in the visual UI, offer screen readers a way to
          // check the connectivity state on demand: the notice will either
          // be present, with explanatory text, or absent. To make it
          // "absent" for screen readers, we make this view and its children
          // unfocusable.
          ...(isNoticeVisible
            ? {
                // Group descendants into a single selectable component. Its
                // text will automatically be the notice text (confirmed
                // experimentally), so no need for an `accessibilityLabel`.
                accessible: true,
              }
            : {
                accessible: false,
                accessibilityElementsHidden: true,
                importantForAccessibility: 'no-hide-descendants',
              })
        }
      >
        <View onLayout={handleNoticeContentAreaLayoutChange} style={styles.noticeContentArea}>
          <ZulipTextIntl
            style={styles.noticeText}
            text={
              shouldShowUncertaintyNotice
                ? 'Please check your Internet connection'
                : 'No Internet connection'
            }
          />
        </View>
      </SafeAreaView>
      <View style={styles.flex1}>
        <OfflineNoticeContext.Provider value={contextValue}>
          {props.children}
        </OfflineNoticeContext.Provider>
      </View>
    </View>
  );
}

type PlaceholderProps = $ReadOnly<{|
  ...ViewProps,
  style?: ViewStylePropWithout<{|
    // Let this component do its job; don't mess with its height.
    height: DimensionValue,
    minHeight: DimensionValue,
    maxHeight: DimensionValue,
  |}>,
|}>;

/**
 * Empty View that expands from 0 height to give room to the offline notice.
 *
 * On every screen, render one of these on the surface that occupies the top
 * of the screen in the Y direction (e.g., an app bar), inside that
 * surface's top-inset padding.
 *
 * The offline notice will be overlaid on top of that surface in the Z
 * direction, blocking part of it from view including its top-inset padding.
 * Use this placeholder to push the content on the underlying surface
 * downward in the Y direction, just enough so it doesn't get hidden by the
 * offline notice's content and only when the offline notice is actually
 * onscreen.
 *
 * On Android, where the app doesn't draw underneath the status bar, this
 * also colors the status bar's background to match the notice.
 *
 * Must have the OfflineNoticeProvider above it in the tree.
 */
export function OfflineNoticePlaceholder(props: PlaceholderProps): Node {
  const theme = useGlobalSelector(state => getGlobalSettings(state).theme);
  const { style: callerStyle } = props;

  const { isNoticeVisible, noticeContentAreaHeight } = useContext(OfflineNoticeContext);

  const style = useMemo(
    () => [
      {
        height: isNoticeVisible ? noticeContentAreaHeight : 0,
        width: '100%',
        backgroundColor: 'transparent',
      },
      callerStyle,
    ],
    [isNoticeVisible, noticeContentAreaHeight, callerStyle],
  );

  return (
    <>
      {
        // On Android, have the notice's background color extend through the
        // status bar. We do this here instead of in OfflineNoticeProvider
        // so our instruction to the status bar doesn't get clobbered by
        // another instruction more leafward than OfflineNoticeProvider.
        isNoticeVisible && (
          <ZulipStatusBar
            // Should match the notice's surface; see OfflineNoticeProvider.
            backgroundColor={backgroundColorForTheme(theme)}
          />
        )
      }
      <View style={style} />
    </>
  );
}
