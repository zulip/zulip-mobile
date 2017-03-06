/* eslint-disable */
import React from 'react';
import AnchorScrollView from '../native/AnchorScrollView';

import config from '../config';

export default class InfiniteScrollView extends React.Component {

  static defaultProps = {
    onStartReachedThreshold: config.startMessageListThreshold,
    onEndReachedThreshold: config.endMessageListThreshold,
  };

  componentDidMount() {
    this._scrollOffset = 0;
  }

  _onContentSizeChanged = (contentWidth, contentHeight) => {
    this._contentHeight = contentHeight;
    this._maybeCallOnStartOrEndReached();
  }

  _onScrollViewLayout = (e) => {
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

  _onScroll = (e) => {
    this._scrollOffset = e.nativeEvent.contentOffset.y;
    this._maybeCallOnStartOrEndReached();
    this.props.onScroll(e.nativeEvent);
  }

  render() {
    return (
      <AnchorScrollView
        style={this.props.style}
        contentContainerStyle={this.props.contentContainerStyle}
        automaticallyAdjustContentInset={false}
        scrollsToTop
        onContentSizeChange={this._onContentSizeChanged}
        onLayout={this._onScrollViewLayout}
        onScroll={this._onScroll}
        scrollEventThrottle={config.scrollCallbackThrottle}
        stickyHeaderIndices={this.props.stickyHeaderIndices}
        autoScrollToBottom={this.props.autoScrollToBottom}
      >
        {this.props.children}
      </AnchorScrollView>
    );
  }
}
