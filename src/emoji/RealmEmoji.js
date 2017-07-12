/* @flow */
import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { connect } from 'react-redux';

import type { Auth } from '../types';
import { getAuth } from '../account/accountSelectors';

const styles = StyleSheet.create({
  image: {
    width: 20,
    height: 20,
  },
});

type Props = {
  auth: Auth,
  realmEmoji: {},
  name: string,
};

class RealmEmoji extends React.PureComponent {
  props: Props;

  render() {
    const { name, realmEmoji, auth } = this.props;

    return (
      <Image
        style={styles.image}
        source={{ uri: auth.realm.concat(realmEmoji[name].source_url) }}
      />
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
  realmEmoji: state.realm.emoji,
}))(RealmEmoji);
