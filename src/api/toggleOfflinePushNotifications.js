/* @flow */
import { Auth } from '../types';
import { apiPatch } from '../api/apiFetch';

export default async (auth: Auth, value: boolean) =>
  apiPatch(
    auth,
    'settings/notifications',
    res => res,
    {
      enable_offline_push_notifications: value,
    },
  );
