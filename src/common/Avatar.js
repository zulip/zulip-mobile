import React from 'react';
import {
  Image,
} from 'react-native';
import { connect } from 'react-redux';

import { getAuth } from '../accountlist/accountlistSelectors';

class Avatar extends React.PureComponent {

  props: {
    realm: string,
    avatarUrl: string,
    size: number,
  }

  static defaultProps = {
    size: 32,
  };

  render() {
    const { avatarUrl, realm, size } = this.props;
    const style = {
      height: size,
      width: size,
      borderRadius: size / 2,
    };
    const sourceUri = /^http/.test(avatarUrl) ? avatarUrl : realm + avatarUrl;

    return (
      <Image
        style={style}
        source={{ uri: sourceUri }}
        resizeMode="contain"
      />
    );
  }
}

const mapStateToProps = (state) => ({
  realm: getAuth(state).get('realm'),
});

export default connect(mapStateToProps)(Avatar);
