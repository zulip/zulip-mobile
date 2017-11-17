/* @flow */
import type { Auth } from '../../types';
import { apiPatch } from '../apiFetch';

const getRequestBody = (opp, value) => {
  const data = {};
  if (opp === 'offline_notification_change') {
    data.enable_offline_push_notifications = value;
  } else if (opp === 'online_notification_change') {
    data.enable_online_push_notifications = value;
  }
  return data;
};

export default async ({ auth, opp, value }: { auth: Auth, opp: string, value: boolean }) =>
  apiPatch(auth, 'settings/notifications', res => res, {
    ...getRequestBody(opp, value),
  });
