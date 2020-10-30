/* @flow strict-local */
import parseMarkdown from 'zulip-markdown-parser';

import * as logging from '../utils/logging';
import type {
  Dispatch,
  GetState,
  GlobalState,
  NamedUser,
  Narrow,
  Outbox,
  UserOrBot,
  Action,
} from '../types';
import {
  MESSAGE_SEND_START,
  TOGGLE_OUTBOX_SENDING,
  DELETE_OUTBOX_MESSAGE,
  MESSAGE_SEND_COMPLETE,
} from '../actionConstants';
import { getAuth } from '../selectors';
import * as api from '../api';
import { getAllUsersByEmail, getOwnUser } from '../users/userSelectors';
import { getUsersAndWildcards } from '../users/userHelpers';
import { caseNarrowPartial } from '../utils/narrow';
import { BackoffMachine } from '../utils/async';

export const messageSendStart = (outbox: Outbox): Action => ({
  type: MESSAGE_SEND_START,
  outbox,
});

export const toggleOutboxSending = (sending: boolean): Action => ({
  type: TOGGLE_OUTBOX_SENDING,
  sending,
});

export const deleteOutboxMessage = (localMessageId: number): Action => ({
  type: DELETE_OUTBOX_MESSAGE,
  local_message_id: localMessageId,
});

export const messageSendComplete = (localMessageId: number): Action => ({
  type: MESSAGE_SEND_COMPLETE,
  local_message_id: localMessageId,
});

export const trySendMessages = (dispatch: Dispatch, getState: GetState): boolean => {
  const state = getState();
  const auth = getAuth(state);
  const outboxToSend = state.outbox.filter(outbox => !outbox.isSent);
  const oneWeekAgoTimestamp = Date.now() / 1000 - 60 * 60 * 24 * 7;
  try {
    outboxToSend.forEach(async item => {
      // If a message has spent over a week in the outbox, it's probably too
      // stale to try sending it.
      //
      // TODO: instead of just throwing these away, create an "unsendable" state
      // (including a reason for unsendability), and transition old messages to
      // that instead.
      if (item.timestamp < oneWeekAgoTimestamp) {
        dispatch(deleteOutboxMessage(item.id));
        return; // i.e., continue
      }

      // prettier-ignore
      const to =
        item.type === 'private'
            // TODO(server-2.0): switch to numeric user IDs, not emails.
          ? item.display_recipient.map(r => r.email).join(',')
            // TODO(server-2.0): switch to numeric stream IDs, not names.
            //   (This will require wiring the stream ID through to here.)
            // HACK: the server attempts to interpret this argument as JSON, then
            //   CSV, then a literal. To avoid misparsing, always use JSON.
          : JSON.stringify([item.display_recipient]);

      await api.sendMessage(auth, {
        type: item.type,
        to,
        subject: item.subject,
        content: item.markdownContent,
        localId: item.timestamp,
        eventQueueId: state.session.eventQueueId,
      });
      dispatch(messageSendComplete(item.timestamp));
    });
    return true;
  } catch (e) {
    logging.warn(e);
    return false;
  }
};

export const sendOutbox = () => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  if (state.outbox.length === 0 || state.session.outboxSending) {
    return;
  }
  dispatch(toggleOutboxSending(true));
  const backoffMachine = new BackoffMachine();
  while (!trySendMessages(dispatch, getState)) {
    await backoffMachine.wait();
  }
  dispatch(toggleOutboxSending(false));
};

// A valid display_recipient with all the thread's users, sorted by ID.
const mapEmailsToUsers = (emails, allUsersByEmail, ownUser) => {
  const result = emails.map(email => {
    const user = allUsersByEmail.get(email);
    if (!user) {
      throw new Error('outbox: missing user when preparing to send PM');
    }
    return { email, id: user.user_id, full_name: user.full_name };
  });
  if (!result.some(r => r.id === ownUser.user_id)) {
    result.push({ email: ownUser.email, id: ownUser.user_id, full_name: ownUser.full_name });
  }
  result.sort((r1, r2) => r1.id - r2.id);
  return result;
};

// TODO type: `string | NamedUser[]` is a bit confusing.
type DataFromNarrow = {|
  type: 'private' | 'stream',
  display_recipient: string | NamedUser[],
  subject: string,
|};

const extractTypeToAndSubjectFromNarrow = (
  narrow: Narrow,
  allUsersByEmail: Map<string, UserOrBot>,
  ownUser: UserOrBot,
): DataFromNarrow => {
  const forPm = emails => ({
    type: 'private',
    display_recipient: mapEmailsToUsers(emails, allUsersByEmail, ownUser),
    subject: '',
  });
  return caseNarrowPartial(narrow, {
    pm: email => forPm([email]),
    groupPm: forPm,

    // TODO: we shouldn't ever be passing a whole-stream narrow here;
    //   ensure we don't, then remove this case
    stream: name => ({ type: 'stream', display_recipient: name, subject: '(no topic)' }),

    topic: (streamName, topic) => ({
      type: 'stream',
      display_recipient: streamName,
      subject: topic,
    }),
  });
};

const getContentPreview = (content: string, state: GlobalState): string => {
  try {
    return parseMarkdown(
      content,
      getUsersAndWildcards(state.users),
      state.streams,
      getAuth(state),
      state.realm.filters,
      state.realm.emoji,
    );
  } catch (e) {
    return content;
  }
};

export const addToOutbox = (narrow: Narrow, content: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const ownUser = getOwnUser(state);

  const localTime = Math.round(new Date().getTime() / 1000);
  dispatch(
    messageSendStart({
      isSent: false,
      ...extractTypeToAndSubjectFromNarrow(narrow, getAllUsersByEmail(state), ownUser),
      markdownContent: content,
      content: getContentPreview(content, state),
      timestamp: localTime,
      id: localTime,
      sender_full_name: ownUser.full_name,
      sender_email: ownUser.email,
      avatar_url: ownUser.avatar_url,
      isOutbox: true,
      reactions: [],
    }),
  );
  dispatch(sendOutbox());
};
