/* @flow */
/* eslint-disable */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { Platform, Keyboard } from 'react-native';

import type { StyleObj, Narrow } from '../types';
import config from '../config';
import { nullFunction } from '../nullObjects';
import AnchorScrollView from './AnchorScrollView';

type Props = {
  startReachedThreshold: number,
  endReachedThreshold: number,
  contentContainerStyle?: Object,
  style: StyleObj,
  stickyHeaderIndices: [],
  anchor?: number,
  narrow?: Narrow,
  autoScrollToBottom?: boolean,
  children?: $ReadOnlyArray<ChildrenArray<*>>,
  listRef?: (component: any) => void,
  onStartReached?: () => void,
  onEndReached?: () => void,
  onScroll: (e: Event) => void,
};

type State = {
  autoScrollToBottom: boolean,
};

let _scrollOffset;
let listComponent;

export default class InfiniteScrollView extends PureComponent<Props, State> {
  props: Props;
  nextProps: Props;
  state: State;
  listComponent: AnchorScrollView;

  // we only need to adjust scroll position after first render
  // for subsequent fetch we don't need to adjust scroll
  // this info is captured in autoScrollToBottom
  state = {
    autoScrollToBottom: true,
  };

  static defaultProps = {
    onStartReached: nullFunction,
    onEndReached: nullFunction,
    startReachedThreshold: config.messageListThreshold,
    endReachedThreshold: config.messageListThreshold,
  };

  _scrollOffset: number;
  _keyboardHeight: number;
  _contentHeight: number;
  _scrollViewHeight: number;
  _sentStartForContentHeight: ?number;
  _sentEndForContentHeight: ?number;

  keyboardShowListener: any;
  keyboardHideListener: any;

  componentDidMount() {
    this.keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      this._keyboardShow,
    );
    this.keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      this._keyboardHide,
    );
  }

  componentWillUnmount() {
    this.keyboardShowListener && this.keyboardShowListener.remove();
    this.keyboardHideListener && this.keyboardHideListener.remove();
  }

  _keyboardShow(e) {
    this._keyboardHeight = e.endCoordinates.height;

    if (!listComponent || !(this._keyboardHeight > 0)) {
      //this._keyboardHeight = undefined;
      return;
    }

    if (_scrollOffset === 0) {
      listComponent.scrollToEnd();
    } else {
      listComponent.scrollTo({
        x: 0,
        y: _scrollOffset + this._keyboardHeight,
        animated: true,
      });
    }
  }

  _keyboardHide() {
    if (_scrollOffset && listComponent && this._keyboardHeight > 0) {
      listComponent.scrollTo({
        x: 0,
        y: _scrollOffset - this._keyboardHeight,
        animated: true,
      });
    }
  }

  componentDidMount() {
    _scrollOffset = 0;
  }

  _onContentSizeChanged = (contentWidth: number, contentHeight: number) => {
    this._contentHeight = contentHeight;
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
      this.setState({
        autoScrollToBottom: false,
      });
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
      this.setState({
        autoScrollToBottom: false,
      });
    }
  }

  _maybeCallOnStartOrEndReached() {
    const distFromStart = _scrollOffset;
    const distFromEnd = this._contentHeight - this._scrollViewHeight - _scrollOffset;

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
    _scrollOffset = e.nativeEvent.contentOffset.y;
    if (
      (e.nativeEvent.updatedChildFrames && e.nativeEvent.updatedChildFrames.length > 0) ||
      (e.nativeEvent.humanInteraction && e.nativeEvent.humanInteraction === 'false')
    ) {
      return; // ignore onScroll events that are not caused by human interaction
    }

    this._maybeCallOnStartOrEndReached();
    this.props.onScroll(e.nativeEvent);
  };

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.narrow !== nextProps.narrow) {
      this.setState({
        autoScrollToBottom: true,
      });
    }
  }

  render() {
    const { autoScrollToBottom } = this.state;
    const { anchor, children, contentContainerStyle, listRef, style } = this.props;

    return (
      <AnchorScrollView
        style={style}
        anchor={anchor}
        contentContainerStyle={contentContainerStyle}
        automaticallyAdjustContentInset={false}
        scrollsToTop
        overScrollMode="always"
        onContentSizeChange={this._onContentSizeChanged}
        onLayout={this._onScrollViewLayout}
        onScroll={this._onScroll}
        scrollEventThrottle={config.scrollCallbackThrottle}
        // stickyHeaderIndices={Platform.OS === 'ios' ? this.props.stickyHeaderIndices : undefined}
        autoScrollToBottom={autoScrollToBottom}
        removeClippedSubviews
        ref={(component: any) => {
          listComponent = component;
          if (listRef) listRef(component);
        }}
      >
        {children}
      </AnchorScrollView>
    );
  }
}
