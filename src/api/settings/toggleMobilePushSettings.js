/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPatch } from '../apiFetch';

const getRequestBody = (opp, value) => {
  const data = {};
  if (opp === 'offline_notification_change') {
    data.enable_offline_push_notifications = value;
  } else if (opp === 'online_notification_change') {
    data.enable_online_push_notifications = value;
  } else if (opp === 'stream_notification_change') {
    data.enable_stream_push_notifications = value;
  }
  return data;
};

export default async ({
  account,
  opp,
  value,
}: {
  account: Account,
  opp: string,
  value: boolean,
}): Promise<ApiResponse> =>
  apiPatch(account, 'settings/notifications', res => res, {
    ...getRequestBody(opp, value),
  });
