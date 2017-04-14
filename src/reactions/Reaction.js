import React from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { connect } from 'react-redux';

import { BRAND_COLOR, HALF_COLOR } from '../styles';
import { Touchable } from '../common';
import Emoji from '../emoji/Emoji';
import { getAuth } from '../account/accountSelectors';
import { emojiReactionAdd, emojiReactionRemove } from '../api';

const styles = StyleSheet.create({
  touchable: {
    marginRight: 4,
    marginTop: 4,
    borderRadius: 4,
  },
  frameCommon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  frameVoted: {
    borderColor: BRAND_COLOR,
    backgroundColor: 'rgba(36, 202, 194, 0.1)',
  },
  frameNotVoted: {
    borderColor: HALF_COLOR,
  },
  placeholderCount: {
    marginLeft: 4,
    color: 'transparent'
  },
  countCommon: {
    marginLeft: 4,
  },
  countVoted: {
    color: BRAND_COLOR,
  },
  countNotVoted: {
    color: HALF_COLOR,
  },
  spinner: {
    position: 'absolute',
    top: -20,
    right: 4
  },
  spinnerText: {
    paddingTop: 3,
    paddingBottom: 3
  }
});

const incrementAnimationConfig = {
  toValue: 1,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99),
  useNativeDriver: true,
};

const decrementAnimationConfig = {
  toValue: 2,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99),
  useNativeDriver: true,
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
    if (nextProps.voteCount > this.props.voteCount) {
      this.incrementSpinner();
    } else if (nextProps.voteCount < this.props.voteCount) {
      this.decrementSpinner();
    }
  };

  handlePress = () => {
    const { auth, messageId, name, voted } = this.props;

    if (voted) {
      emojiReactionRemove(auth, messageId, name);
    } else {
      emojiReactionAdd(auth, messageId, name);
    }
  };

  incrementSpinner = () => {
    this.state.voteChangeAnimation.setValue(0);
    Animated.timing(this.state.voteChangeAnimation, incrementAnimationConfig).start();
  };

  decrementSpinner = () => {
    this.state.voteChangeAnimation.setValue(1);
    Animated.timing(this.state.voteChangeAnimation, decrementAnimationConfig).start();
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
  });

  render() {
    const { name, voted, voteCount } = this.props;
    const frameStyle = voted ? styles.frameVoted : styles.frameNotVoted;
    const countStyle = voted ? styles.countVoted : styles.countNotVoted;

    return (
      <Touchable onPress={this.handlePress} style={styles.touchable}>
        <View style={[styles.frameCommon, frameStyle]}>
          <Emoji name={name} />

          <Animated.View style={this.dynamicSpinnerStyles()}>
            <Text style={[styles.spinnerText, countStyle]}>{voteCount - 1}</Text>
            <Text style={[styles.spinnerText, countStyle]}>{voteCount}</Text>
            <Text style={[styles.spinnerText, countStyle]}>{voteCount + 1}</Text>
          </Animated.View>

          <Text style={styles.placeholderCount}>
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
