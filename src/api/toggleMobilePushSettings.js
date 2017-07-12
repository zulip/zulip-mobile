/* @flow */
import { apiPatch } from '../api/apiFetch';
import type { Auth } from '../types';

const removeUndefinedValues = (offline, online) => {
  const data = {};
  if (!offline) {
    data.enable_offline_push_notifications = offline;
  }
  if (!online) {
    data.enable_online_push_notifications = online;
  }
  return data;
};

export default async ({
  auth,
  online,
  offline,
}: {
  auth: Auth,
  offline?: boolean,
  online?: boolean,
}) =>
  apiPatch(auth, 'settings/notifications', res => res, {
    ...removeUndefinedValues(offline, online),
  });
