/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { User, InjectedDispatch } from '../types';
import { connect } from '../react-redux';
import { getCurrentRealm, getSelfUserDetail } from '../selectors';
import UserAvatar from './UserAvatar';
import { getAvatarFromUser } from '../utils/avatar';

type OwnProps = {|
  size: number,
|};

type SelectorProps = {|
  realm: string,
  user: User,
|};

type Props = {|
  ...InjectedDispatch,
  ...OwnProps,
  ...SelectorProps,
|};

/**
 * Renders an image of the current user's avatar
 *
 * @prop size - Sets width and height in pixels.
 */
class OwnAvatar extends PureComponent<Props> {
  render() {
    const { user, size, realm } = this.props;
    const fullAvatarUrl = getAvatarFromUser(user, realm);
    return <UserAvatar avatarUrl={fullAvatarUrl} size={size} />;
  }
}

export default connect((state): SelectorProps => ({
  realm: getCurrentRealm(state),
  user: getSelfUserDetail(state),
}))(OwnAvatar);
