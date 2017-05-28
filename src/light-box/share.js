/* @flow */
import Share from 'react-native-share';

export default (url: string) => {
  const shareOptions = {
    url,
    subject: 'Shared using Zulip',
  };
  Share.open(shareOptions)
    .catch(err => {});
};
