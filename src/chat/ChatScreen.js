/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { useSelector, useDispatch } from '../react-redux';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { ThemeContext, createStyleSheet } from '../styles';
import type { Narrow, EditMessage } from '../types';
import KeyboardAvoider from '../common/KeyboardAvoider';
import ChatNavBar from '../nav/ChatNavBar';
import MessageList from '../webview/MessageList';
import NoMessages from '../message/NoMessages';
import FetchError from './FetchError';
import InvalidNarrow from './InvalidNarrow';
import { fetchMessagesInNarrow } from '../message/fetchActions';
import ComposeBox from '../compose/ComposeBox';
import UnreadNotice from './UnreadNotice';
import { showComposeBoxOnNarrow, caseNarrowDefault, keyFromNarrow } from '../utils/narrow';
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
import { useConditionalEffect } from '../reactUtils';
import { useStartEditTopic } from '../boot/TopicEditModalProvider';

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
  const caughtUp = useSelector(state => getCaughtUpForNarrow(state, narrow));
  const messages = useSelector(state => getShownMessagesForNarrow(state, narrow));
  const firstUnreadIdInNarrow = useSelector(state => getFirstUnreadIdInNarrow(state, narrow));

  // This could live in state, but then we'd risk pointless rerenders;
  // we only use it in our `useEffect` callbacks. Using `useRef` is
  // like using instance variables in class components:
  //   https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables
  const shouldFetchWhenNextFocused = React.useRef<boolean>(false);
  const scheduleFetch = useCallback(() => {
    shouldFetchWhenNextFocused.current = true;
  }, []);

  const [fetchError, setFetchError] = React.useState<mixed>(null);

  const fetch = React.useCallback(async () => {
    shouldFetchWhenNextFocused.current = false;
    try {
      await dispatch(fetchMessagesInNarrow(narrow));
    } catch (errorIllTyped) {
      const e: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
      setFetchError(e);
    }
  }, [dispatch, narrow]);

  // When we have a new event queue, schedule a fetch.
  React.useEffect(() => {
    if (eventQueueId !== null) {
      scheduleFetch();
    }
  }, [eventQueueId, scheduleFetch]);

  // If we stop having any data at all about the messages in this narrow --
  // we don't know any, and nor do we know if there are some -- then
  // schedule a fetch.  (As long as we have *some* messages, we'll show a
  // proper MessageList, and scroll events can cause us to fetch newer or
  // older messages.  But with none, we'll show NoMessages.)
  //
  // TODO: We may still briefly show NoMessages; this render will have
  //   isFetching false, even though the fetch effect will cause a rerender
  //   with isFetching true.  It'd be nice to avoid that.
  const nothingKnown = messages.length === 0 && !caughtUp.older && !caughtUp.newer;
  useConditionalEffect(scheduleFetch, nothingKnown);

  // On first mount, fetch.  (This also makes a fetch no longer scheduled,
  // so the if-scheduled fetch below doesn't also fire.)
  React.useEffect(() => {
    fetch();
  }, [fetch]);

  // When a fetch is scheduled and we're focused, fetch.
  React.useEffect(() => {
    if (shouldFetchWhenNextFocused.current && isFocused === true) {
      fetch();
    }
    // No dependencies list, to run this effect after every render.  This
    // effect does its own checking of whether any work needs to be done.
  });

  return { fetchError, isFetching, messages, firstUnreadIdInNarrow };
};

export default function ChatScreen(props: Props): Node {
  const { route, navigation } = props;
  const { backgroundColor } = React.useContext(ThemeContext);

  const { narrow, editMessage } = route.params;
  const setEditMessage = useCallback(
    (value: EditMessage | null) => navigation.setParams({ editMessage: value }),
    [navigation],
  );
  const startEditTopic = useStartEditTopic();

  const isNarrowValid = useSelector(state => getIsNarrowValid(state, narrow));
  const draft = useSelector(state => getDraftForNarrow(state, narrow));

  const { fetchError, isFetching, messages, firstUnreadIdInNarrow } = useMessagesWithFetch({
    narrow,
  });

  const showMessagePlaceholders = messages.length === 0 && isFetching;
  const sayNoMessages = messages.length === 0 && !isFetching;
  const showComposeBox = showComposeBoxOnNarrow(narrow) && !showMessagePlaceholders;

  const auth = useSelector(getAuth);
  const dispatch = useDispatch();
  const fetching = useSelector(state => getFetchingForNarrow(state, narrow));
  const _ = useContext(TranslationContext);

  const sendCallback = useCallback(
    (message: string, destinationNarrow: Narrow) => {
      if (editMessage) {
        const content = editMessage.content !== message ? message : undefined;
        const topic = caseNarrowDefault(
          destinationNarrow,
          // eslint-disable-next-line no-shadow
          { topic: (streamId, topic) => (topic !== editMessage.topic ? topic : undefined) },
          () => undefined,
        );

        if ((content !== undefined && content !== '') || (topic !== undefined && topic !== '')) {
          api.updateMessage(auth, editMessage.id, { content, subject: topic }).catch(error => {
            showErrorAlert(_('Failed to edit message'), error.message);
          });
        }

        setEditMessage(null);
      } else {
        if (fetching.newer) {
          // If we're fetching, that means that (a) we're scrolled near the
          // bottom, and likely are scrolled to the very bottom so that it
          // looks like we're showing the latest messages, but (b) we don't
          // actually have the latest messages.  So the user may be misled
          // and send a reply that doesn't make sense with the later context.
          //
          // Ideally in this condition we'd show a warning to make sure the
          // user knows what they're getting into, and then let them send
          // anyway.  We'd also then need to take care with how the
          // resulting message appears in the message list: see #3800 and
          //   https://chat.zulip.org/#narrow/stream/48-mobile/topic/Failed.20to.20send.20on.20Android/near/1158162
          //
          // For now, just refuse to send.  After all, this condition will
          // resolve itself when we complete the fetch, and if that doesn't
          // happen soon then it's unlikely we could successfully send a
          // message anyway.
          showErrorAlert(_('Failed to send message'));
          return;
        }

        dispatch(addToOutbox(destinationNarrow, message));
      }
    },
    [_, auth, fetching.newer, dispatch, editMessage, setEditMessage],
  );

  return (
    <KeyboardAvoider style={[componentStyles.screen, { backgroundColor }]} behavior="padding">
      <ChatNavBar narrow={narrow} editMessage={editMessage} />
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
              initialScrollMessageId={
                firstUnreadIdInNarrow
                // `messages` might be empty
                ?? (messages[messages.length - 1]: (typeof messages)[number] | void)?.id
                ?? null
              }
              showMessagePlaceholders={showMessagePlaceholders}
              startEditMessage={setEditMessage}
              startEditTopic={startEditTopic}
            />
          );
        }
      })()}
      {showComposeBox && (
        <ComposeBox
          narrow={narrow}
          isEditing={editMessage !== null}
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
