/* @flow */
import type { Auth } from '../types';
import config from '../config';
import { apiPost } from './apiFetch';

export default (auth: Auth) =>
  apiPost(auth, 'register', res => res, {
    apply_markdown: true,
    event_types: JSON.stringify(config.trackServerEvents),
    fetch_event_types: JSON.stringify(config.serverDataOnStartup),
    include_subscribers: false,
    client_gravatar: true,
  });
