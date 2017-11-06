/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

package com.zulipmobile;

import javax.annotation.Nullable;

import java.util.Map;

import android.graphics.Color;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ReactClippingViewGroupHelper;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.views.scroll.FpsListener;
import com.facebook.react.views.scroll.ReactScrollViewCommandHelper;
import com.facebook.react.views.scroll.ScrollEventType;

public class AnchorScrollViewManager
        extends ViewGroupManager<AnchorScrollView>
        implements ReactScrollViewCommandHelper.ScrollCommandHandler<AnchorScrollView> {

    protected static final String REACT_CLASS = "AnchorScrollView";

    private @Nullable FpsListener mFpsListener = null;

    public AnchorScrollViewManager() {
        this(null);
    }

    public AnchorScrollViewManager(@Nullable FpsListener fpsListener) {
        mFpsListener = fpsListener;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public AnchorScrollView createViewInstance(ThemedReactContext context) {
        return new AnchorScrollView(context, mFpsListener);
    }

    @ReactProp(name = "scrollEnabled", defaultBoolean = true)
    public void setScrollEnabled(AnchorScrollView view, boolean value) {
        view.setScrollEnabled(value);
    }

    @ReactProp(name = "showsVerticalScrollIndicator")
    public void setShowsVerticalScrollIndicator(AnchorScrollView view, boolean value) {
        view.setVerticalScrollBarEnabled(value);
    }

    @ReactProp(name = ReactClippingViewGroupHelper.PROP_REMOVE_CLIPPED_SUBVIEWS, defaultBoolean = true)
    public void setRemoveClippedSubviews(AnchorScrollView view, boolean removeClippedSubviews) {
        view.setRemoveClippedSubviews(removeClippedSubviews);
    }

    /**
     * Computing momentum events is potentially expensive since we post a runnable on the UI thread
     * to see when it is done.  We only do that if {@param sendMomentumEvents} is set to true.  This
     * is handled automatically in js by checking if there is a listener on the momentum events.
     *
     * @param view
     * @param sendMomentumEvents
     */
    @ReactProp(name = "sendMomentumEvents")
    public void setSendMomentumEvents(AnchorScrollView view, boolean sendMomentumEvents) {
        view.setSendMomentumEvents(sendMomentumEvents);
    }

    /**
     * Tag used for logging scroll performance on this scroll view. Will force momentum events to be
     * turned on (see setSendMomentumEvents).
     *
     * @param view
     * @param scrollPerfTag
     */
    @ReactProp(name = "scrollPerfTag")
    public void setScrollPerfTag(AnchorScrollView view, String scrollPerfTag) {
        view.setScrollPerfTag(scrollPerfTag);
    }

    /**
     * boolean used to check whether we need to adjust scroll position after render
     * @param view
     * @param autoScrollToBottom
     */
    @ReactProp(name = "autoScrollToBottom", defaultBoolean = false)
    public void setAutoScrollToBottom(AnchorScrollView view, boolean autoScrollToBottom) {
        view.setAutoScrollToBottom(autoScrollToBottom);
    }

    /**
     * id of the first unread message, to which we need to scroll
     * @param view
     * @param anchor
     */
    @ReactProp(name = "anchor", defaultInt = -1)
    public void setAnchor(AnchorScrollView view, int anchor) {
        view.setAnchor(anchor);
    }

    /**
     * When set, fills the rest of the scrollview with a color to avoid setting a background and
     * creating unnecessary overdraw.
     * @param view
     * @param color
     */
    @ReactProp(name = "endFillColor", defaultInt = Color.TRANSPARENT, customType = "Color")
    public void setBottomFillColor(AnchorScrollView view, int color) {
        view.setEndFillColor(color);
    }

    /**
     * Controls overScroll behaviour
     */
    @ReactProp(name = "overScrollMode")
    public void setOverScrollMode(AnchorScrollView view, String value) {
        view.setOverScrollMode(AnchorScrollViewHelper.parseOverScrollMode(value));
    }

    @Override
    public @Nullable Map<String, Integer> getCommandsMap() {
        return ReactScrollViewCommandHelper.getCommandsMap();
    }

    @Override
    public void receiveCommand(
            AnchorScrollView scrollView,
            int commandId,
            @Nullable ReadableArray args) {
        ReactScrollViewCommandHelper.receiveCommand(this, scrollView, commandId, args);
    }

    @Override
    public void scrollTo(
            AnchorScrollView scrollView,
            ReactScrollViewCommandHelper.ScrollToCommandData data) {
        if (data.mAnimated) {
            scrollView.smoothScrollTo(data.mDestX, data.mDestY);
        } else {
            scrollView.scrollTo(data.mDestX, data.mDestY);
        }
    }

    @Override
    public void scrollToEnd(
            AnchorScrollView scrollView,
            ReactScrollViewCommandHelper.ScrollToEndCommandData data) {
        // ScrollView always has one child - the scrollable area
        int bottom =
                scrollView.getChildAt(0).getHeight() + scrollView.getPaddingBottom();
        if (data.mAnimated) {
            scrollView.smoothScrollTo(scrollView.getScrollX(), bottom);
        } else {
            scrollView.scrollTo(scrollView.getScrollX(), bottom);
        }
    }

    @Override
    public void flashScrollIndicators(AnchorScrollView scrollView) {
        scrollView.flashScrollIndicators();
    }

    @Override
    public @Nullable Map getExportedCustomDirectEventTypeConstants() {
        return createExportedCustomDirectEventTypeConstants();
    }

    public static Map createExportedCustomDirectEventTypeConstants() {
        return MapBuilder.builder()
                .put(ScrollEventType.SCROLL.getJSEventName(), MapBuilder.of("registrationName", "onScroll"))
                .put(ScrollEventType.BEGIN_DRAG.getJSEventName(), MapBuilder.of("registrationName", "onScrollBeginDrag"))
                .put(ScrollEventType.END_DRAG.getJSEventName(), MapBuilder.of("registrationName", "onScrollEndDrag"))
                .put(ScrollEventType.MOMENTUM_BEGIN.getJSEventName(), MapBuilder.of("registrationName", "onMomentumScrollBegin"))
                .put(ScrollEventType.MOMENTUM_END.getJSEventName(), MapBuilder.of("registrationName", "onMomentumScrollEnd"))
                .build();
    }
}
