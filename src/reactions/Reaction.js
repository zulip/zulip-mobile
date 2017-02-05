import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';

import { BRAND_COLOR } from '../common/styles';
import { Touchable } from '../common';
import Emoji from '../emoji/Emoji';
import { getAuth } from '../account/accountSelectors';
import { emojiReactionAdd, emojiReactionRemove } from '../api';

const styles = StyleSheet.create({
  touchable: {
    marginRight: 4,
  },
  frameCommon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  frameVoted: {
    borderColor: BRAND_COLOR,
    backgroundColor: 'rgba(36, 202, 194, 0.05)',
  },
  frameNotVoted: {
    borderColor: '#dedede', // eslint-disable-line
  },
  countCommon: {
    marginLeft: 4,
  },
  countVoted: {
    color: BRAND_COLOR,
  },
  countNotVoted: {
    color: 'gray',
  },
});

class Reaction extends React.PureComponent {

  props: {
    name: string,
    voted: boolean,
  };

  handlePress = () => {
    const { auth, messageId, name, voted } = this.props;

    if (voted) {
      emojiReactionRemove(auth, messageId, name);
    } else {
      emojiReactionAdd(auth, messageId, name);
    }
  };

  render() {
    const { name, voted, voteCount } = this.props;
    const frameStyle = voted ? styles.frameVoted : styles.frameNotVoted;
    const countStyle = voted ? styles.countVoted : styles.countNotVoted;

    return (
      <Touchable onPress={this.handlePress} style={styles.touchable}>
        <View style={[styles.frameCommon, frameStyle]}>
          <Emoji name={name} />
          <Text style={[styles.countCommon, countStyle]}>
            {voteCount}
          </Text>
        </View>
      </Touchable>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
});

export default connect(mapStateToProps)(Reaction);
