import { apiPost, Auth } from './apiFetch';

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

export default async (
  auth: Auth,
  hasFocus: boolean,
  newUserInput: boolean,
): Presences =>
  apiPost(
    auth,
    'users/me/presence',
    { status: hasFocus ? 'active' : 'idle', new_user_input: newUserInput },
    res => res.presences,
  );
