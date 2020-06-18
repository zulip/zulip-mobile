/* @flow strict-local */
import { PixelRatio } from 'react-native';

import template from './template';
import type { UserOrBot } from '../../types';

const typingAvatar = (realm: URL, user: UserOrBot): string => template`
<div class="avatar">
  <img
    class="avatar-img"
    data-sender-id="${user.user_id}"
    src="${user.avatar_url
      .get(
        // 48 logical pixels; see `.avatar` and `.avatar img` in
        // src/webview/static/base.css.
        PixelRatio.getPixelSizeForLayoutSize(48),
      )
      .toString()}">
</div>
`;

export default (realm: URL, users: $ReadOnlyArray<UserOrBot>): string => template`
  $!${users.map(user => typingAvatar(realm, user)).join('')}
  <div class="content">
    <span></span>
    <span></span>
    <span></span>
  </div>
`;
