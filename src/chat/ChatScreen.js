/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useSelector, useDispatch } from '../react-redux';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { ThemeContext, createStyleSheet } from '../styles';
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
import { canSendToNarrow, caseNarrowDefault, keyFromNarrow } from '../utils/narrow';
import { getLoading, getSession } from '../directSelectors';
import { getFetchingForNarrow } from './fetchingSelectors';
import { getShownMessagesForNarrow, isNarrowValid as getIsNarrowValid } from './narrowsSelectors';
import { getFirstUnreadIdInNarrow } from '../message/messageSelectors';
import { getDraftForNarrow } from '../drafts/draftsSelectors';
import { addToOutbox } from '../actions';
import { getAuth, getCaughtUpForNarrow } from '../selectors';
import { showErrorAlert } from '../utils/info';
import { TranslationContext } from '../boot/TranslationProvider';
import * as api from '../api';

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
const useMessagesWithFetch = args => {
  const { narrow } = args;

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const eventQueueId = useSelector(state => getSession(state).eventQueueId);
  const loading = useSelector(getLoading);
  const fetching = useSelector(state => getFetchingForNarrow(state, narrow));
  const isFetching = fetching.older || fetching.newer || loading;
  const messages = useSelector(state => getShownMessagesForNarrow(state, narrow));
  const haveNoMessages = messages.length === 0;
  const firstUnreadIdInNarrow = useSelector(state => getFirstUnreadIdInNarrow(state, narrow));

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

  return { fetchError, isFetching, messages, haveNoMessages, firstUnreadIdInNarrow };
};

export default function ChatScreen(props: Props): Node {
  const { route, navigation } = props;
  const { backgroundColor } = React.useContext(ThemeContext);

  const { narrow, editMessage } = route.params;
  const setEditMessage = useCallback(
    (value: EditMessage | null) => navigation.setParams({ editMessage: value }),
    [navigation],
  );

  const isNarrowValid = useSelector(state => getIsNarrowValid(state, narrow));
  const draft = useSelector(state => getDraftForNarrow(state, narrow));

  const {
    fetchError,
    isFetching,
    messages,
    haveNoMessages,
    firstUnreadIdInNarrow,
  } = useMessagesWithFetch({ narrow });

  const showMessagePlaceholders = haveNoMessages && isFetching;
  const sayNoMessages = haveNoMessages && !isFetching;
  const showComposeBox = canSendToNarrow(narrow) && !showMessagePlaceholders;

  const auth = useSelector(getAuth);
  const dispatch = useDispatch();
  const caughtUp = useSelector(state => getCaughtUpForNarrow(state, narrow));
  const _ = useContext(TranslationContext);

  const sendCallback = useCallback(
    (message: string, destinationNarrow: Narrow) => {
      if (editMessage) {
        const content = editMessage.content !== message ? message : undefined;
        const subject = caseNarrowDefault(
          destinationNarrow,
          { topic: (stream, topic) => (topic !== editMessage.topic ? topic : undefined) },
          () => undefined,
        );

        if (
          (content !== undefined && content !== '')
          || (subject !== undefined && subject !== '')
        ) {
          api.updateMessage(auth, { content, subject }, editMessage.id).catch(error => {
            showErrorAlert(_('Failed to edit message'), error.message);
          });
        }

        setEditMessage(null);
      } else {
        if (!caughtUp.newer) {
          showErrorAlert(_('Failed to send message'));
          return;
        }

        dispatch(addToOutbox(destinationNarrow, message));
      }
    },
    [_, auth, caughtUp.newer, dispatch, editMessage, setEditMessage],
  );

  return (
    <KeyboardAvoider style={[componentStyles.screen, { backgroundColor }]} behavior="padding">
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
              messages={messages}
              initialScrollMessageId={firstUnreadIdInNarrow}
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
          initialTopic={editMessage ? editMessage.topic : undefined}
          initialMessage={editMessage ? editMessage.content : draft}
          onSend={sendCallback}
          autoFocusMessage={editMessage !== null}
          key={keyFromNarrow(narrow) + (editMessage?.id.toString() ?? 'noedit')}
        />
      )}
    </KeyboardAvoider>
  );
}
