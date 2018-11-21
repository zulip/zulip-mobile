/* @flow */
import type { Account } from './apiTypes';
import { apiPost } from './apiFetch';

export default (account: Account, eventTypes: string[], fetchEventTypes: string[]) =>
  apiPost(account, 'register', res => res, {
    apply_markdown: true,
    event_types: JSON.stringify(eventTypes),
    fetch_event_types: JSON.stringify(fetchEventTypes),
    include_subscribers: false,
    client_gravatar: true,
  });
