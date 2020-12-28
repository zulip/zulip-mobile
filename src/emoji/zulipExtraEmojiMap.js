/* @flow strict-local */
import type { ImageEmojiType } from '../types';

/**
 * Make this to ressemble with realm emoji
 * so that both emoji type can be handled in similiar way
 * thus id has no meaning here
 */
const zulipExtraEmojiMap: { [id: string]: ImageEmojiType } = {
  zulip: {
    deactivated: false,
    code: 'zulip',
    name: 'zulip',
    source_url: '/static/generated/emoji/images/emoji/unicode/zulip.png',
  },
};

export default zulipExtraEmojiMap;
