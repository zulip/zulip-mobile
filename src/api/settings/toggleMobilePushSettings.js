/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
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
  auth,
  opp,
  value,
}: {|
  auth: Auth,
  opp: string,
  value: boolean,
|}): Promise<ApiResponse> =>
  apiPatch(auth, 'settings/notifications', {
    ...getRequestBody(opp, value),
  });
