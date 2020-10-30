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
  User,
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
import { getSelfUserDetail, getUsersByEmail } from '../users/userSelectors';
import { getUsersAndWildcards } from '../users/userHelpers';
import { isStreamNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { BackoffMachine } from '../utils/async';
import { NULL_USER } from '../nullObjects';

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

      const to = ((): string => {
        const { narrow } = item;
        // TODO: can this test be `if (item.type === private)`?
        if (isPrivateOrGroupNarrow(narrow)) {
          return narrow[0].operand;
        } else {
          // HACK: the server attempts to interpret this argument as JSON, then
          // CSV, then a literal. To avoid misparsing, always use JSON.
          return JSON.stringify([item.display_recipient]);
        }
      })();

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

const mapEmailsToUsers = (emails, usersByEmail, selfDetail) =>
  emails
    .map(item => {
      const user = usersByEmail.get(item) || NULL_USER;
      return { email: item, id: user.user_id, full_name: user.full_name };
    })
    .concat({ email: selfDetail.email, id: selfDetail.user_id, full_name: selfDetail.full_name });

// TODO type: `string | NamedUser[]` is a bit confusing.
type DataFromNarrow = {|
  type: 'private' | 'stream',
  display_recipient: string | NamedUser[],
  subject: string,
|};

const extractTypeToAndSubjectFromNarrow = (
  narrow: Narrow,
  usersByEmail: Map<string, User>,
  selfDetail: { email: string, user_id: number, full_name: string },
): DataFromNarrow => {
  if (isPrivateOrGroupNarrow(narrow)) {
    return {
      type: 'private',
      display_recipient: mapEmailsToUsers(narrow[0].operand.split(','), usersByEmail, selfDetail),
      subject: '',
    };
  } else if (isStreamNarrow(narrow)) {
    return { type: 'stream', display_recipient: narrow[0].operand, subject: '(no topic)' };
  }
  return { type: 'stream', display_recipient: narrow[0].operand, subject: narrow[1].operand };
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
  const userDetail = getSelfUserDetail(state);

  const localTime = Math.round(new Date().getTime() / 1000);
  dispatch(
    messageSendStart({
      narrow,
      isSent: false,
      ...extractTypeToAndSubjectFromNarrow(narrow, getUsersByEmail(state), userDetail),
      markdownContent: content,
      content: getContentPreview(content, state),
      timestamp: localTime,
      id: localTime,
      sender_full_name: userDetail.full_name,
      sender_email: userDetail.email,
      avatar_url: userDetail.avatar_url,
      isOutbox: true,
      reactions: [],
    }),
  );
  dispatch(sendOutbox());
};
