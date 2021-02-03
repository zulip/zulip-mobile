/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { useSelector, useDispatch } from '../react-redux';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import styles, { ThemeContext, createStyleSheet } from '../styles';
import type { Narrow, EditMessage } from '../types';
import { KeyboardAvoider, OfflineNotice } from '../common';
import ChatNavBar from '../nav/ChatNavBar';
import MessageList from '../webview/MessageList';
import NoMessages from '../message/NoMessages';
import FetchError from './FetchError';
import InvalidNarrow from './InvalidNarrow';
import { fetchMessagesInNarrow } from '../message/fetchActions';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';
import { canSendToNarrow } from '../utils/narrow';
import { getLoading, getSession } from '../directSelectors';
import { getFetchingForNarrow } from './fetchingSelectors';
import { getShownMessagesForNarrow, isNarrowValid as getIsNarrowValid } from './narrowsSelectors';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'chat'>,
  route: RouteProp<'chat', {| narrow: Narrow, editMessage: EditMessage | null |}>,
|}>;

const componentStyles = createStyleSheet({
  screen: {
    flex: 1,
    flexDirection: 'column',
  },
});

/**
 * Fetch messages for this narrow and report an error, if any
 *
 * See `MessagesState` for background about the fetching, including
 * why this is nearly the only place where additional data fetching
 * is required.  See `fetchMessagesInNarrow` and `fetchMessages` for
 * more details, including how Redux is kept up-to-date during the
 * whole process.
 */
const useFetchMessages = args => {
  const { narrow } = args;

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const eventQueueId = useSelector(state => getSession(state).eventQueueId);
  const loading = useSelector(getLoading);
  const fetching = useSelector(state => getFetchingForNarrow(state, narrow));
  const isFetching = fetching.older || fetching.newer || loading;
  const haveNoMessages = useSelector(
    state => getShownMessagesForNarrow(state, narrow).length === 0,
  );

  // This could live in state, but then we'd risk pointless rerenders;
  // we only use it in our `useEffect` callbacks. Using `useRef` is
  // like using instance variables in class components:
  //   https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables
  const shouldFetchWhenNextFocused = React.useRef<boolean>(false);

  const [fetchError, setFetchError] = React.useState<Error | null>(null);

  const fetch = React.useCallback(async () => {
    shouldFetchWhenNextFocused.current = false;
    try {
      await dispatch(fetchMessagesInNarrow(narrow));
    } catch (e) {
      setFetchError(e);
    }
  }, [dispatch, narrow]);

  // When the event queue changes, schedule a fetch.
  React.useEffect(() => {
    shouldFetchWhenNextFocused.current = true;
  }, [eventQueueId]);

  // On first mount, fetch. Also unset `shouldFetchWhenNextFocused.current`
  // that was set in the previous `useEffect`, so the fetch below doesn't
  // also fire.
  React.useEffect(() => {
    fetch();
  }, [fetch]);

  // When a fetch is scheduled and we're focused, fetch.
  React.useEffect(() => {
    if (shouldFetchWhenNextFocused.current && isFocused === true) {
      fetch();
    }
    // `eventQueueId` needed here because it affects `shouldFetchWhenNextFocused`.
  }, [isFocused, eventQueueId, fetch]);

  return { fetchError, isFetching, haveNoMessages };
};

export default function ChatScreen(props: Props) {
  const { route, navigation } = props;
  const { backgroundColor } = React.useContext(ThemeContext);

  const { narrow, editMessage } = route.params;
  const setEditMessage = (value: EditMessage | null) =>
    navigation.setParams({ editMessage: value });

  const isNarrowValid = useSelector(state => getIsNarrowValid(state, narrow));

  const { fetchError, isFetching, haveNoMessages } = useFetchMessages({ narrow });

  const showMessagePlaceholders = haveNoMessages && isFetching;
  const sayNoMessages = haveNoMessages && !isFetching;
  const showComposeBox = canSendToNarrow(narrow) && !showMessagePlaceholders;

  return (
    <View style={[componentStyles.screen, { backgroundColor }]}>
      <KeyboardAvoider style={styles.flexed} behavior="padding">
        <ChatNavBar narrow={narrow} editMessage={editMessage} />
        <OfflineNotice />
        <UnreadNotice narrow={narrow} />
        {(() => {
          if (!isNarrowValid) {
            return <InvalidNarrow narrow={narrow} />;
          } else if (fetchError !== null) {
            return <FetchError narrow={narrow} error={fetchError} />;
          } else if (sayNoMessages) {
            return <NoMessages narrow={narrow} />;
          } else {
            return (
              <MessageList
                narrow={narrow}
                showMessagePlaceholders={showMessagePlaceholders}
                startEditMessage={setEditMessage}
              />
            );
          }
        })()}
        {showComposeBox && (
          <ComposeBox
            narrow={narrow}
            editMessage={editMessage}
            completeEditMessage={() => setEditMessage(null)}
          />
        )}
      </KeyboardAvoider>
    </View>
  );
}
