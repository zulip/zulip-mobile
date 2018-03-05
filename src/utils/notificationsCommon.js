/* @flow */
import { topicNarrow, privateNarrow } from '../utils/narrow';
import type { Actions } from '../types';

export const handleNotification = (data: Object, actions: Actions): void => {
  if (!data || !data.recipient_type) return;

  const narrow =
    data.recipient_type === 'stream'
      ? topicNarrow(data.stream, data.topic)
      : privateNarrow(data.sender_email);

  actions.doNarrow(narrow, data.zulip_message_id);
};
