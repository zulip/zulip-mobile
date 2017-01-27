/* eslint-disable */
import React from 'react';
import { ScrollView } from 'react-native';

const DEFAULT_START_REACHED_THRESHOLD = 500;
const DEFAULT_END_REACHED_THRESHOLD = 500;
const DEFAULT_SCROLL_CALLBACK_THROTTLE = 50;

class InfiniteScrollView extends React.Component {
  componentDidMount() {
    this._scrollOffset = 0;

    // We need to make sure we're using the right version of RCTScrollView
    // Otherwise, scroll behavior will be subtly broken
    if (__DEV__) {
      if (!ScrollView.propTypes.hasOwnProperty('anchorMode')) {
        console.error(
          'RCTScrollView does not have custom extensions to support' +
          ' anchored behavior. Are you using the zulip/react-native fork?'
        );
      }
    }
  }

  _onContentSizeChanged(contentWidth, contentHeight) {
    const oldContentHeight = this._contentHeight;
    this._contentHeight = contentHeight;
    this._maybeCallOnStartOrEndReached();
  }

  _onScrollViewLayout(e) {
    this._scrollViewHeight = e.nativeEvent.layout.height;
  }

  _maybeCallOnStartReached(distFromStart) {
    if (this.props.onStartReached &&
        this._contentHeight &&
        distFromStart <= this.props.onStartReachedThreshold &&
        this._sentStartForContentHeight !== this._contentHeight) {
      this._sentStartForContentHeight = this._contentHeight;
      this.props.onStartReached();
    }
  }

  _maybeCallOnEndReached(distFromEnd) {
    if (this.props.onEndReached &&
        this._contentHeight &&
        distFromEnd <= this.props.onEndReachedThreshold &&
        this._sentEndForContentHeight !== this._contentHeight) {
      this._sentEndForContentHeight = this._contentHeight;
      this.props.onEndReached();
    }
  }

  _maybeCallOnStartOrEndReached() {
    const distFromStart = this._scrollOffset;
    const distFromEnd = this._contentHeight - this._scrollViewHeight - this._scrollOffset;

    this._maybeCallOnStartReached(distFromStart);
    if (this.props.onStartReached &&
        distFromStart > this.props.onStartReachedThreshold) {
      this._sentStartForContentHeight = null;
    }

    this._maybeCallOnEndReached(distFromEnd);
    if (this.props.onEndReached &&
        distFromEnd > this.props.onEndReachedThreshold) {
      this._sentEndForContentHeight = null;
    }
  }

  _onScroll(e) {
    this._scrollOffset = e.nativeEvent.contentOffset['y'];
    this._maybeCallOnStartOrEndReached();
    this.props.onScroll(e.nativeEvent);
  }

  render() {
    return (
      <ScrollView
        style={this.props.style}
        contentContainerStyle={this.props.contentContainerStyle}
        automaticallyAdjustContentInset={false}
        scrollsToTop
        onContentSizeChange={this._onContentSizeChanged.bind(this)}
        onLayout={this._onScrollViewLayout.bind(this)}
        onScroll={this._onScroll.bind(this)}
        scrollEventThrottle={DEFAULT_SCROLL_CALLBACK_THROTTLE}
        stickyHeaderIndices={this.props.stickyHeaderIndices}
        anchorMode
        anchorIndices={this.props.anchorIndices}
        anchorMap={this.props.anchorMap}
        autoScrollToBottom={this.props.autoScrollToBottom}
      >
        {this.props.children}
      </ScrollView>
    );
  }
}

InfiniteScrollView.defaultProps = {
  onStartReachedThreshold: DEFAULT_START_REACHED_THRESHOLD,
  onEndReachedThreshold: DEFAULT_END_REACHED_THRESHOLD,
};

export default InfiniteScrollView;
