/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 * <p>
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

package com.zulipmobile;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Rect;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.widget.OverScroller;
import android.widget.ScrollView;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.common.ReactConstants;
import com.facebook.react.uimanager.MeasureSpecAssertions;
import com.facebook.react.uimanager.ReactClippingViewGroup;
import com.facebook.react.uimanager.ReactClippingViewGroupHelper;
import com.facebook.react.uimanager.events.NativeGestureUtil;
import com.facebook.react.views.scroll.FpsListener;
import com.facebook.react.views.scroll.OnScrollDispatchHelper;
import com.facebook.react.views.view.ReactViewGroup;

import java.lang.reflect.Field;
import java.util.ArrayList;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class AnchorScrollView extends ScrollView implements ReactClippingViewGroup, ViewGroup.OnHierarchyChangeListener, View.OnLayoutChangeListener {

    private static String TAG = AnchorScrollView.class.getSimpleName();
    private static Field sScrollerField;
    private static boolean sTriedToGetScrollerField = false;
    private static Field sAllReactChildrenField;
    private static boolean sTriedAllReactChildrenField = false;

    private final OnScrollDispatchHelper mOnScrollDispatchHelper = new OnScrollDispatchHelper();
    private final OverScroller mScroller;

    private
    @Nullable
    Rect mClippingRect;
    private boolean mDoneFlinging;
    private boolean mDragging;
    private boolean mFlinging;
    private boolean mRemoveClippedSubviews;
    private boolean mScrollEnabled = true;
    private boolean mSendMomentumEvents;
    private
    @Nullable
    FpsListener mFpsListener = null;
    private
    @Nullable
    String mScrollPerfTag;
    private
    @Nullable
    Drawable mEndBackground;
    private int mEndFillColor = Color.TRANSPARENT;
    private ViewGroup mContentView;

    private String mAnchorTag;
    private int mLastAnchorY;
    private ScrollView scrollView;
    private boolean autoScrollToBottom = false;
    private int anchor;

    public AnchorScrollView(ReactContext context) {
        this(context, null);
    }

    public AnchorScrollView(ReactContext context, @Nullable FpsListener fpsListener) {
        super(context);
        scrollView = this;
        mFpsListener = fpsListener;

        if (!sTriedToGetScrollerField) {
            sTriedToGetScrollerField = true;
            try {
                sScrollerField = ScrollView.class.getDeclaredField("mScroller");
                sScrollerField.setAccessible(true);
            } catch (NoSuchFieldException e) {
                Log.w(
                        ReactConstants.TAG,
                        "Failed to get mScroller field for ScrollView! " +
                                "This app will exhibit the bounce-back scrolling bug :(");
            }
        }

        if (sScrollerField != null) {
            try {
                Object scroller = sScrollerField.get(this);
                if (scroller instanceof OverScroller) {
                    mScroller = (OverScroller) scroller;
                } else {
                    Log.w(
                            ReactConstants.TAG,
                            "Failed to cast mScroller field in ScrollView (probably due to OEM changes to AOSP)! " +
                                    "This app will exhibit the bounce-back scrolling bug :(");
                    mScroller = null;
                }
            } catch (IllegalAccessException e) {
                throw new RuntimeException("Failed to get mScroller from ScrollView!", e);
            }
        } else {
            mScroller = null;
        }

        getAllReactChildrenField(null);
        setOnHierarchyChangeListener(this);
        setScrollBarStyle(SCROLLBARS_OUTSIDE_OVERLAY);

        this.setOnTouchListener(new OnTouchListener() {
            private ViewTreeObserver observer;

            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if (observer == null) {
                    observer = getViewTreeObserver();
                    observer.addOnScrollChangedListener(onScrollChangedListener);
                } else if (!observer.isAlive()) {
                    observer.removeOnScrollChangedListener(onScrollChangedListener);
                    observer = getViewTreeObserver();
                    observer.addOnScrollChangedListener(onScrollChangedListener);
                }

                return false;
            }
        });

        scrollView.setFillViewport(true);
    }

    @Override
    protected void onScrollChanged(int l, int t, int oldl, int oldt) {
        super.onScrollChanged(l, t, oldl, oldt);

        if (mOnScrollDispatchHelper.onScrollChanged(l, t)) {
            if (mRemoveClippedSubviews) {
                updateClippingRect();
            }

            if (mFlinging) {
                mDoneFlinging = false;
            }
        }
    }

    final ViewTreeObserver.OnScrollChangedListener onScrollChangedListener = new
            ViewTreeObserver.OnScrollChangedListener() {

                @Override
                public void onScrollChanged() {
                    if (mOnScrollDispatchHelper.onScrollChanged(getScrollX(), getScrollY())) {
                        if (mRemoveClippedSubviews) {
                            updateClippingRect();
                        }

                        if (mFlinging) {
                            mDoneFlinging = false;
                        }
                        findAnchorView();
                        AnchorScrollViewHelper.emitScrollEvent(scrollView, getVisibleIds(), true);
                    }
                }
            };


    // Zulip changes
    public void getAllReactChildrenField(Class clazz) {
        // inspired by https://github.com/facebook/react-native/blob/master/ReactAndroid/src/main/java/com/facebook/react/views/scroll/ReactScrollView.java#L75
        if (!sTriedAllReactChildrenField) {
            sTriedAllReactChildrenField = true;
            try {
                sAllReactChildrenField = (clazz == null ? ReactViewGroup.class : clazz).getDeclaredField("mAllChildren");
                sAllReactChildrenField.setAccessible(true);
            } catch (NoSuchFieldException e) {
                Log.e(TAG, "Failed to get mAllChildren field for ReactViewGroup!");
            }
        }
    }

    public void setSendMomentumEvents(boolean sendMomentumEvents) {
        mSendMomentumEvents = sendMomentumEvents;
    }

    public void setScrollPerfTag(String scrollPerfTag) {
        mScrollPerfTag = scrollPerfTag;
    }

    public void setScrollEnabled(boolean scrollEnabled) {
        mScrollEnabled = scrollEnabled;
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        MeasureSpecAssertions.assertExplicitMeasureSpec(widthMeasureSpec, heightMeasureSpec);

        setMeasuredDimension(
                MeasureSpec.getSize(widthMeasureSpec),
                MeasureSpec.getSize(heightMeasureSpec));
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        // Call with the present values in order to re-layout if necessary
        scrollTo(getScrollX(), getScrollY());
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        if (mRemoveClippedSubviews) {
            updateClippingRect();
        }
        findAnchorView();
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        if (mRemoveClippedSubviews) {
            updateClippingRect();
        }
        findAnchorView();
    }

    // Zulip changes
    protected void findAnchorView() {
        if (mContentView == null) {
            //mContentView can be null as we are setting it to null onChildViewRemoved
            return;
        }
        // Set up anchor view
        mAnchorTag = null;

        if (mRemoveClippedSubviews && !(mContentView instanceof ReactViewGroup)) {
            getAllReactChildrenField(mContentView.getClass());
        }
        View[] children = null;
        if (mRemoveClippedSubviews && sAllReactChildrenField != null) {
            try {
                children = (View[]) sAllReactChildrenField.get(mContentView);
            } catch (IllegalAccessException e) {
                Log.e(TAG, "Failed to get mAllChildren field for " + mContentView.getClass().getSimpleName());
                return;
            }
        }

        int arrLength = mRemoveClippedSubviews && children != null ? children.length : mContentView.getChildCount();
        for (int i = 0; i < arrLength; i++) {
            View child = mRemoveClippedSubviews && children != null ? children[i] : mContentView.getChildAt(i);
            if (child == null || !(child.getTag() instanceof String)) {
                continue;
            }

            String tag = (String) child.getTag();
            if (child.getBottom() >= getScrollY()) {
                mLastAnchorY = child.getTop();
                mAnchorTag = tag;
                break;
            }
        }
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        if (!mScrollEnabled) {
            return false;
        }

        if (super.onInterceptTouchEvent(ev)) {
            NativeGestureUtil.notifyNativeGestureStarted(this, ev);
            AnchorScrollViewHelper.emitScrollBeginDragEvent(this);
            mDragging = true;
            enableFpsListener();
            return true;
        }

        return false;
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        if (!mScrollEnabled) {
            return false;
        }

        int action = ev.getAction() & MotionEvent.ACTION_MASK;
        if (action == MotionEvent.ACTION_UP && mDragging) {
            AnchorScrollViewHelper.emitScrollEndDragEvent(this);
            mDragging = false;
            disableFpsListener();
        }
        return super.onTouchEvent(ev);
    }

    @Override
    public boolean getRemoveClippedSubviews() {
        return mRemoveClippedSubviews;
    }

    @Override
    public void setRemoveClippedSubviews(boolean removeClippedSubviews) {
        if (removeClippedSubviews && mClippingRect == null) {
            mClippingRect = new Rect();
        }
        mRemoveClippedSubviews = removeClippedSubviews;
        updateClippingRect();
    }

    @Override
    public void updateClippingRect() {
        if (!mRemoveClippedSubviews) {
            return;
        }

        Assertions.assertNotNull(mClippingRect);

        ReactClippingViewGroupHelper.calculateClippingRect(this, mClippingRect);
        View contentView = getChildAt(0);
        if (contentView instanceof ReactClippingViewGroup) {
            ((ReactClippingViewGroup) contentView).updateClippingRect();
        }
    }

    @Override
    public void getClippingRect(Rect outClippingRect) {
        outClippingRect.set(Assertions.assertNotNull(mClippingRect));
    }

    @Override
    public void fling(int velocityY) {
        if (mScroller != null) {
            // FB SCROLLVIEW CHANGE

            // We provide our own version of fling that uses a different call to the standard OverScroller
            // which takes into account the possibility of adding new content while the ScrollView is
            // animating. Because we give essentially no max Y for the fling, the fling will continue as long
            // as there is content. See #onOverScrolled() to see the second part of this change which properly
            // aborts the scroller animation when we get to the bottom of the ScrollView content.

            int scrollWindowHeight = getHeight() - getPaddingBottom() - getPaddingTop();

            mScroller.fling(
                    getScrollX(),
                    getScrollY(),
                    0,
                    velocityY,
                    0,
                    0,
                    0,
                    Integer.MAX_VALUE,
                    0,
                    scrollWindowHeight / 2);

            postInvalidateOnAnimation();

            // END FB SCROLLVIEW CHANGE
        } else {
            super.fling(velocityY);
        }

        if (mSendMomentumEvents || isScrollPerfLoggingEnabled()) {
            mFlinging = true;
            enableFpsListener();
            AnchorScrollViewHelper.emitScrollMomentumBeginEvent(this);
            Runnable r = new Runnable() {
                @Override
                public void run() {
                    if (mDoneFlinging) {
                        mFlinging = false;
                        disableFpsListener();
                        AnchorScrollViewHelper.emitScrollMomentumEndEvent(AnchorScrollView.this);
                    } else {
                        mDoneFlinging = true;
                        AnchorScrollView.this.postOnAnimationDelayed(this, AnchorScrollViewHelper.MOMENTUM_DELAY);
                    }
                }
            };
            postOnAnimationDelayed(r, AnchorScrollViewHelper.MOMENTUM_DELAY);
        }
    }

    private void enableFpsListener() {
        if (isScrollPerfLoggingEnabled()) {
            Assertions.assertNotNull(mFpsListener);
            Assertions.assertNotNull(mScrollPerfTag);
            mFpsListener.enable(mScrollPerfTag);
        }
    }

    private void disableFpsListener() {
        if (isScrollPerfLoggingEnabled()) {
            Assertions.assertNotNull(mFpsListener);
            Assertions.assertNotNull(mScrollPerfTag);
            mFpsListener.disable(mScrollPerfTag);
        }
    }

    private boolean isScrollPerfLoggingEnabled() {
        return mFpsListener != null && mScrollPerfTag != null && !mScrollPerfTag.isEmpty();
    }

    private int getMaxScrollY() {
        int contentHeight = mContentView.getHeight();
        int viewportHeight = getHeight() - getPaddingBottom() - getPaddingTop();
        return Math.max(0, contentHeight - viewportHeight);
    }

    // Zulip changes
    public ArrayList<String> getVisibleIds() {
        ArrayList<String> visibleIds = new ArrayList<>();
        if (mContentView instanceof ReactViewGroup) {
            for (int i = 0; i < mContentView.getChildCount(); i++) {
                View child = mContentView.getChildAt(i);
                if (child != null && isMessageTag(child) && isChildVisible(child)) {
                    visibleIds.add((String) child.getTag());
                }
            }
        }
        return visibleIds;
    }

    // Zulip changes
    private boolean isChildVisible(@Nonnull View child) {
        //container
        int height = getHeight();
        int containerTop = getScrollY();
        int containerBottom = containerTop + height;

        //child
        int viewTop = child.getTop();
        int viewBottom = child.getBottom();

        //check if child is visible or not
        return (viewTop >= containerTop && viewBottom <= containerBottom) || child.getHeight() >= height;
    }

    // Zulip changes
    private boolean isMessageTag(@Nonnull View child) {
        return (child.getTag() instanceof String);
    }

    @Override
    public void draw(Canvas canvas) {
        if (mEndFillColor != Color.TRANSPARENT) {
            final View content = getChildAt(0);
            if (mEndBackground != null && content != null && content.getBottom() < getHeight()) {
                mEndBackground.setBounds(0, content.getBottom(), getWidth(), getHeight());
                mEndBackground.draw(canvas);
            }
        }
        super.draw(canvas);
    }

    public void setEndFillColor(int color) {
        if (color != mEndFillColor) {
            mEndFillColor = color;
            mEndBackground = new ColorDrawable(mEndFillColor);
        }
    }

    @Override
    protected void onOverScrolled(int scrollX, int scrollY, boolean clampedX, boolean clampedY) {
        if (mScroller != null) {
            // FB SCROLLVIEW CHANGE

            // This is part two of the reimplementation of fling to fix the bounce-back bug. See #fling() for
            // more information.

            if (!mScroller.isFinished() && mScroller.getCurrY() != mScroller.getFinalY()) {
                int scrollRange = getMaxScrollY();
                if (scrollY >= scrollRange) {
                    mScroller.abortAnimation();
                    scrollY = scrollRange;
                }
            }

            // END FB SCROLLVIEW CHANGE
        }

        super.onOverScrolled(scrollX, scrollY, clampedX, clampedY);
    }

    @Override
    public void onChildViewAdded(View parent, View child) {
        assert mContentView instanceof ViewGroup;
        mContentView = (ViewGroup) child;
        mContentView.addOnLayoutChangeListener(this);
    }

    @Override
    public void onChildViewRemoved(View parent, View child) {
        mContentView.removeOnLayoutChangeListener(this);
        mContentView = null;
    }

    /**
     * Called when a mContentView's layout has changed. Fixes the scroll position if it's too large
     * after the content resizes. Without this, the user would see a blank ScrollView when the scroll
     * position is larger than the ScrollView's max scroll position after the content shrinks.
     */
    @Override
    public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight, int oldBottom) {
        if (mContentView == null) {
            return;
        }

        int currentScrollY = getScrollY();
        int maxScrollY = getMaxScrollY();
        if (currentScrollY > maxScrollY) {
            scrollTo(getScrollX(), maxScrollY);
        }

        // Zulip changes
        if (mAnchorTag != null) {
            View mAnchorView = null;

            if (mRemoveClippedSubviews && !(mContentView instanceof ReactViewGroup)) {
                getAllReactChildrenField(mContentView.getClass());
            }
            View[] children = null;
            if (mRemoveClippedSubviews && sAllReactChildrenField != null) {
                try {
                    children = (View[]) sAllReactChildrenField.get(mContentView);
                } catch (IllegalAccessException e) {
                    Log.e(TAG, "Failed to get mAllChildren field for " + mContentView.getClass().getSimpleName());
                    return;
                }
            }

            int arrLength = children != null ? children.length : mContentView.getChildCount();
            View previousChild = null; //adjust scroll position is such a way that last read message and first unread message both are visible at same time
            for (int i = 0; i < arrLength; i++) {
                View child = children != null ? children[i] : mContentView.getChildAt(i);

                if (child != null) {
                    if (autoScrollToBottom && String.valueOf(anchor).equals(child.getTag())) {
                        mAnchorView = previousChild != null ? previousChild : child;
                        break;
                    } else if (mAnchorTag.equals(child.getTag())) {
                        mAnchorView = child;
                    }
                }

                previousChild = child;
            }
            if (mAnchorView != null) {
                if (autoScrollToBottom) {
                    if (anchor == -1) {
                        //first unread message not found
                        //one case may be no message is unread
                        //scroll to end
                        scrollView.smoothScrollTo(scrollView.getScrollX(), getScrollViewBottom());
                    } else {
                        final int topPosition = mAnchorView.getTop();
                        scrollView.post(new Runnable() {
                            public void run() {
                                scrollView.smoothScrollTo(0, topPosition);
                            }
                        });
                    }
                } else {
                    int anchorChange = mAnchorView.getTop() - mLastAnchorY;
                    scrollTo(getScrollX(), currentScrollY + anchorChange);
                }
            } else {
                // not able to get anchor
                scrollView.smoothScrollTo(scrollView.getScrollX(), getScrollViewBottom());
            }
            //send events to fetch more if whole screen is not occupied
            if (canNotScroll()) {
                AnchorScrollViewHelper.emitScrollEvent(AnchorScrollView.this, getVisibleIds(), true);
            } else {
                //send event to update scroll offset, which will be useful when keyboard pop's up
                // this event is without human interaction
                AnchorScrollViewHelper.emitScrollEvent(AnchorScrollView.this, getVisibleIds(), false);
            }
        }
        findAnchorView();
    }

    /**
     * @return bottom position of the scrollView
     */
    private int getScrollViewBottom() {
        // ScrollView always has one child - the scrollable area
        return scrollView.getChildAt(0).getHeight() + scrollView.getPaddingBottom();
    }

    private int getScrollRange() {
        int scrollRange = 0;
        if (getChildCount() > 0) {
            View child = getChildAt(0);
            scrollRange = Math.max(0,
                    child.getHeight() - (getHeight() - getPaddingBottom() - getPaddingTop()));
        }
        return scrollRange;
    }

    private boolean canNotScroll() {
        try {
            return getHeight() > getChildAt(0).getHeight();
        } catch (Exception e) {
            int scrollRange = getScrollRange();
            int maxScrollY = getMaxScrollY();
            if (scrollRange == 0 && maxScrollY == 0) {
                return true;
            }
        }
        return false;
    }

    public void flashScrollIndicators() {
        awakenScrollBars();
    }

    public void setAutoScrollToBottom(boolean autoScrollToBottom) {
        this.autoScrollToBottom = autoScrollToBottom;
    }

    public void setAnchor(int anchor) {
        this.anchor = anchor;
    }

    @Override
    public void setOverScrollMode(int mode) {
        super.setOverScrollMode(mode);
    }
}
