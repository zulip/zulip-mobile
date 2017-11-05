/* @flow */
/* eslint-disable */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { Platform } from 'react-native';

import type { StyleObj } from '../types';
import config from '../config';
import { nullFunction } from '../nullObjects';
import AnchorScrollView from '../native/AnchorScrollView';

type Props = {
  startReachedThreshold: number,
  endReachedThreshold: number,
  contentContainerStyle?: Object,
  style: StyleObj,
  stickyHeaderIndices: [],
  autoScrollToBottom?: boolean,
  children?: $ReadOnlyArray<ChildrenArray<*>>,
  listRef?: (component: any) => void,
  onStartReached?: () => void,
  onEndReached?: () => void,
  onScroll: (e: Event) => void,
};

export default class InfiniteScrollView extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    onStartReached: nullFunction,
    onEndReached: nullFunction,
    startReachedThreshold: config.messageListThreshold,
    endReachedThreshold: config.messageListThreshold,
  };

  _scrollOffset: number;
  _contentHeight: number;
  _scrollViewHeight: number;
  _sentStartForContentHeight: ?number;
  _sentEndForContentHeight: ?number;

  componentDidMount() {
    this._scrollOffset = 0;
  }

  _onContentSizeChanged = (contentWidth: number, contentHeight: number) => {
    this._contentHeight = contentHeight;
    if (this.props.onContentSizeChange) {
      this.props.onContentSizeChange(contentWidth, contentHeight);
    }
  };

  _onScrollViewLayout = (e: Object) => {
    this._scrollViewHeight = e.nativeEvent.layout.height;
  };

  _maybeCallOnStartReached(distFromStart: number) {
    if (
      this.props.onStartReached &&
      this._contentHeight &&
      distFromStart <= this.props.startReachedThreshold &&
      this._sentStartForContentHeight !== this._contentHeight
    ) {
      this._sentStartForContentHeight = this._contentHeight;
      this.props.onStartReached();
    }
  }

  _maybeCallOnEndReached(distFromEnd) {
    if (
      this.props.onEndReached &&
      this._contentHeight &&
      distFromEnd <= this.props.endReachedThreshold &&
      this._sentEndForContentHeight !== this._contentHeight
    ) {
      this._sentEndForContentHeight = this._contentHeight;
      this.props.onEndReached();
    }
  }

  _maybeCallOnStartOrEndReached() {
    const distFromStart = this._scrollOffset;
    const distFromEnd = this._contentHeight - this._scrollViewHeight - this._scrollOffset;

    this._maybeCallOnStartReached(distFromStart);
    if (this.props.onStartReached && distFromStart > this.props.startReachedThreshold) {
      this._sentStartForContentHeight = null;
    }

    this._maybeCallOnEndReached(distFromEnd);
    if (this.props.onEndReached && distFromEnd > this.props.endReachedThreshold) {
      this._sentEndForContentHeight = null;
    }
  }

  _onScroll = e => {
    if (e.nativeEvent.updatedChildFrames && e.nativeEvent.updatedChildFrames.length > 0) {
      return; // ignore onScroll events that are not caused by human interaction
    }

    this._scrollOffset = e.nativeEvent.contentOffset.y;
    this._maybeCallOnStartOrEndReached();
    this.props.onScroll(e.nativeEvent);
  };

  render() {
    const { style, children, contentContainerStyle, autoScrollToBottom, listRef } = this.props;

    return (
      <AnchorScrollView
        style={style}
        contentContainerStyle={contentContainerStyle}
        automaticallyAdjustContentInset={false}
        scrollsToTop
        onContentSizeChange={this._onContentSizeChanged}
        onLayout={this._onScrollViewLayout}
        onScroll={this._onScroll}
        scrollEventThrottle={config.scrollCallbackThrottle}
        // stickyHeaderIndices={Platform.OS === 'ios' ? this.props.stickyHeaderIndices : undefined}
        autoScrollToBottom={autoScrollToBottom}
        removeClippedSubviews
        ref={(component: any) => {
          if (listRef) listRef(component);
        }}
      >
        {children}
      </AnchorScrollView>
    );
  }
}
