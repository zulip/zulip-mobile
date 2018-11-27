/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, Image } from 'react-native';

import type { GlobalState, RealmEmojiType } from '../types';
import { getActiveRealmEmojiByName } from '../selectors';

const styles = StyleSheet.create({
  image: {
    width: 20,
    height: 20,
  },
});

type Props = {
  activeRealmEmojiByName: { [string]: RealmEmojiType },
  name: string,
};

class RealmEmoji extends PureComponent<Props> {
  props: Props;

  render() {
    const { name, activeRealmEmojiByName } = this.props;

    if (!activeRealmEmojiByName[name]) {
      return null;
    }

    return <Image style={styles.image} source={{ uri: activeRealmEmojiByName[name].source_url }} />;
  }
}

export default connect((state: GlobalState) => ({
  activeRealmEmojiByName: getActiveRealmEmojiByName(state),
}))(RealmEmoji);
