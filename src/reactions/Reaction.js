import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';

import { Touchable } from '../common';
import Emoji from '../emoji/Emoji';
import { getAuth } from '../account/accountSelectors';
import { emojiReactionAdd, emojiReactionRemove } from '../api';

const styles = StyleSheet.create({
  frameCommon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 4,
  },
  frameVoted: {
    borderColor: '#3aa3e3', // eslint-disable-line
    backgroundColor: '#f0f7fb', // eslint-disable-line
  },
  frameNotVoted: {
    borderColor: '#dedede', // eslint-disable-line
  },
  countCommon: {
    marginLeft: 4,
  },
  countVoted: {
    color: '#3aa3e3', // eslint-disable-line
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
      <Touchable onPress={this.handlePress}>
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
