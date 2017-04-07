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

const debounce = (fn, duration) => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, duration);
  };
};

class Reaction extends React.PureComponent {

  props: {
    name: string,
    voted: boolean,
  };

  constructor(props) {
    super(props);
    this.state = {
      // Local value of vote count
      count: props.voteCount,
      // Should counter increment on tap?
      inc: !props.voted,
      voteChangeAnimation: new Animated.Value(0)
    };
  }

  componentWillReceiveProps = (nextProps) => {
    // Check if current UI data is in sync with server
    // If not so, update the UI
    const { voteCount, voted } = nextProps;
    const { count } = this.state;

    if (voteCount > count) {
      this.incrementCounter();
    } else if ( voteCount < count ) {
      this.decrementCounter();
    }

    this.setState({
      inc: !voted
    });
  }

  incrementCounter = () => {
    this.setState({
      count: this.state.count + 1,
    });

    this.state.voteChangeAnimation.setValue(0);
    Animated.timing(this.state.voteChangeAnimation, incrementAnimationConfig).start();
  };

  decrementCounter = () => {
    this.setState({
      count: this.state.count - 1,
    });

    this.state.voteChangeAnimation.setValue(1);
    Animated.timing(this.state.voteChangeAnimation, decrementAnimationConfig).start();
  };

  toggleCounter = () => {
    if (this.state.inc) {
      this.incrementCounter();
    } else {
      this.decrementCounter();
    }

    this.setState({
      inc: !this.state.inc
    });
  };

  handlePress = () => {
    this.toggleCounter();
    this.processVote();
  };

  processVote = debounce(() => {
    const { auth, messageId, name, voted } = this.props;

    if (voted) {
      emojiReactionRemove(auth, messageId, name);
    } else {
      emojiReactionAdd(auth, messageId, name);
    }
  }, 500);

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
    const { inc, count } = this.state;

    const frameStyle = inc ? styles.frameNotVoted : styles.frameVoted
    const countStyle = inc ? styles.countNotVoted : styles.countVoted;

    return (
      <Touchable onPress={this.handlePress} style={styles.touchable}>
        <Animated.View style={[styles.frameCommon, frameStyle]}>
          <Emoji name={name} />

          <Animated.View style={this.dynamicSpinnerStyles()}>
            <Text style={[styles.spinnerText, countStyle]}>{count- 1}</Text>
            <Text style={[styles.spinnerText, countStyle]}>{count}</Text>
            <Text style={[styles.spinnerText, countStyle]}>{count+ 1}</Text>
          </Animated.View>

          <Text style={styles.placeholderCount}>
            {count}
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
