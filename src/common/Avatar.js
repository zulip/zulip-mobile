import React from 'react';

import ImageAvatar from './ImageAvatar';
import TextAvatar from './TextAvatar';

export default class Avatar extends React.PureComponent {

  props: {
    avatarUrl: string,
    name: string,
    size: number,
  }

  static defaultProps = {
    name: '',
    size: 32,
  };

  render() {
    const { avatarUrl, name, size } = this.props;

    return avatarUrl
      ? <ImageAvatar avatarUrl={avatarUrl} size={size} />
      : <TextAvatar name={name} size={size} />;
  }
}
