/* eslint-disable camelcase*/

import markdown from './markdown';
import { getUserByFullName, getUserByEmail } from '../../users/userSelectors';
import { NULL_USER, NULL_STREAM } from '../../nullObjects';
import { getStreamByName } from '../../subscriptions/subscriptionSelectors';

export default (text: string, users, streams, auth): string => {
  const self = getUserByEmail(users, auth.email);
  const people = {
    get_by_name: (name: string) => {
      const user = getUserByFullName(users, name);
      if (user === NULL_USER) return undefined;
      return { user_id: user.id, full_name: user.fullName };
    },
    is_my_user_id: (user_id: number) => self.id === user_id,
  };
  const stream_data = {
    get_sub: (streamName: string) => {
      const stream = getStreamByName(streams, streamName);
      return stream === NULL_STREAM ? undefined : stream;
    },
  };
  markdown.initialize(people, stream_data, auth.realm);
  return markdown.apply_markdown(text, people, stream_data);
};
