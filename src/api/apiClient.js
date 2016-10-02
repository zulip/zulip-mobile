import { encodeAsURI } from '../lib/util';
import { apiFetch, Auth } from './apiFetch';

export type Backend = 'dev' | 'google' | 'password';

export type Account = {
  accountId: number,
  activeBackend: Backend,
  authBackends: string[],
  directAdmins?: string[],
  directUsers?: string[],
};

export type UserStatus = 'active' | 'inactive' | 'offline';

export type Presence = {
  client: string,
  pushable: boolean,
  status: UserStatus,
  timestamp: number,
};

export type ClientPresence = {
  [key: string]: Presence,
};

export type Presences = {
  [key: string]: ClientPresence,
};

export const getAuthBackends = async (auth: Auth) => {
  const res = await apiFetch(auth, 'get_auth_backends', {
    method: 'get',
  });

  // Return the available backends as a list
  const backends = [];
  if (res.result === 'success') {
    if (res.password) backends.push('password');
    if (res.google) backends.push('google');
    if (res.dev) backends.push('dev');
  }
  if (!backends) {
    throw new Error('No backends available.');
  }
  return backends;
};

export const devGetEmails = async (auth: Auth) => {
  const res = await apiFetch(auth, 'dev_get_emails', {
    method: 'get',
  });
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return [res.direct_admins, res.direct_users];
};

export const devFetchApiKey = async (auth: Auth, email: string) => {
  const res = await apiFetch(auth, 'dev_fetch_api_key', {
    method: 'post',
    body: encodeAsURI({
      username: email,
    }),
  });
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return res.api_key;
};

export const fetchApiKey = async (auth: Auth, email: string, password: string) => {
  const res = await apiFetch(auth, 'fetch_api_key', {
    method: 'post',
    body: encodeAsURI({
      username: email,
      password,
    }),
  });
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return res.api_key;
};

export const getMessages = async (
  auth: Auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow: Object,
) => {
  const params = encodeAsURI({
    anchor,
    num_before: numBefore,
    num_after: numAfter,
    narrow: JSON.stringify(narrow),
  });
  const res = await apiFetch(auth, `messages?${params}`, {
    method: 'get',
  });
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return res.messages;
};

export const focusPing = async (
  auth: Auth,
  hasFocus: boolean,
  newUserInput: boolean,
): Presences => {
  const res = await apiFetch(auth, 'users/me/presence', {
    method: 'post',
    body: encodeAsURI({
      status: hasFocus ? 'active' : 'idle',
      new_user_input: newUserInput,
    }),
  });
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return res.presences;
};

export const getUsers = async (
  auth: Auth,
): any => {
  const res = await apiFetch(auth, 'users', {
    method: 'get',
  });
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return res.members;
};

export const messagesFlags = async (
  auth: Auth,
  messages: number[],
  op: string,
  flag: string,
): number[] => {
  const res = await apiFetch(auth, 'messages/flags', {
    method: 'post',
    body: encodeAsURI({
      messages,
      flag,
      op,
    }),
  });
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return res.messages;
};

export const registerForEvents = async (auth: Auth) =>
  await apiFetch(auth, 'register', {
    method: 'post',
  });

export const pollForEvents = async (auth: Auth, queueId: number, lastEventId: number) => {
  const params = encodeAsURI({
    queue_id: queueId,
    last_event_id: lastEventId,
  });
  const res = await apiFetch(auth, `events?${params}`, {
    method: 'get',
  });
  if (res.result !== 'success') {
    throw new Error(res.msg);
  }
  return res;
};
