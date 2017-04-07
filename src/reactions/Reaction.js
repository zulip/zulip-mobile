import React from 'react';
import { StyleSheet, Text, Animated, Easing } from 'react-native';
import { connect } from 'react-redux';

import { BRAND_COLOR } from '../common/styles';
import { Touchable } from '../common';
import Emoji from '../emoji/Emoji';
import { getAuth } from '../account/accountSelectors';
import { emojiReactionAdd, emojiReactionRemove } from '../api';

const styles = StyleSheet.create({
  touchable: {
    marginRight: 4,
    borderRadius: 4
  },
  frameCommon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden'
  },
  frameVoted: {
    borderColor: BRAND_COLOR,
    backgroundColor: 'rgba(36, 202, 194, 0.05)',
  },
  frameNotVoted: {
    borderColor: '#dedede', // eslint-disable-line
  },
  placeholderCount: {
    marginLeft: 4,
    color: 'transparent'
  },
  countVoted: {
    color: BRAND_COLOR,
  },
  countNotVoted: {
    color: 'gray',
  },
  spinner: {
    position: 'absolute',
    top: -20,
    right: 4,
  },
  spinnerText: {
    paddingTop: 3,
    paddingBottom: 3
  }
});

const incrementAnimationConfig = {
  toValue: 1,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99)
};

const decrementAnimationConfig = {
  toValue: 2,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99)
};

class Reaction extends React.PureComponent {

  state = {
    voteChangeAnimation: new Animated.Value(0)
  };

  props: {
    name: string,
    voted: boolean,
  };

  componentWillReceiveProps = (nextProps) => {
    const { voteCount } = this.props;

    if (nextProps.voteCount > voteCount) {
      this.incrementCounter();
    } else if (nextProps.voteCount < voteCount) {
      this.decrementCounter();
    }
  }

  incrementCounter = () => {
    this.state.voteChangeAnimation.setValue(0);
    Animated.timing(this.state.voteChangeAnimation, incrementAnimationConfig).start();
  }

  decrementCounter = () => {
    this.state.voteChangeAnimation.setValue(1);
    Animated.timing(this.state.voteChangeAnimation, decrementAnimationConfig).start();
  }

  handlePress = () => {
    const { auth, messageId, name, voted } = this.props;

    if (voted) { // Already voted for this emoji then decrement vote count
      emojiReactionRemove(auth, messageId, name);
    } else { // If hasn't already voted increment the vote count
      emojiReactionAdd(auth, messageId, name);
    }
  };

  dynamicSpinnerStyles = () => ({
    ...StyleSheet.flatten(styles.spinner),
    transform: [
      {
        translateY: this.state.voteChangeAnimation.interpolate({
          inputRange: [0, 0.5, 1, 1.5, 2],
          outputRange: [0, 20, 0, -20, 0]
        })
      }
    ]
  })

  render() {
    const { name, voted, voteCount } = this.props;
    const frameStyle = voted ? styles.frameVoted : styles.frameNotVoted;
    const countStyle = voted ? styles.countVoted : styles.countNotVoted;

    return (
      <Touchable onPress={this.handlePress} style={styles.touchable}>
        <Animated.View style={[styles.frameCommon, frameStyle]}>
          <Emoji name={name} />

          <Animated.View style={this.dynamicSpinnerStyles()}>
            <Text style={[styles.spinnerText, countStyle]}>{voteCount - 1}</Text>
            <Text style={[styles.spinnerText, countStyle]}>{voteCount}</Text>
            <Text style={[styles.spinnerText, countStyle]}>{voteCount + 1}</Text>
          </Animated.View>

          <Text style={styles.placeholderCount}>
            {voteCount}
          </Text>
        </Animated.View>
      </Touchable>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
});

export default connect(mapStateToProps)(Reaction);
