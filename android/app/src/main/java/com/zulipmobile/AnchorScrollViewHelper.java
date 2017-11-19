/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 * <p>
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

package com.zulipmobile;

import android.support.annotation.Nullable;
import android.view.View;
import android.view.ViewGroup;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.views.scroll.ScrollEventType;

import java.util.ArrayList;

/**
 * Helper class that deals with emitting Scroll Events.
 */
public class AnchorScrollViewHelper {

    public static final long MOMENTUM_DELAY = 20;
    public static final String OVER_SCROLL_ALWAYS = "always";
    public static final String AUTO = "auto";
    public static final String OVER_SCROLL_NEVER = "never";

    /**
     * Used by {@link AnchorScrollView}
     */
    public static void emitScrollEvent(ViewGroup scrollView, @Nullable ArrayList<String> visibleIds,
                                       @Nullable boolean humanInteraction) {
        emitScrollEvent(scrollView, ScrollEventType.SCROLL, visibleIds, humanInteraction);
    }

    public static void emitScrollBeginDragEvent(ViewGroup scrollView) {
        emitScrollEvent(scrollView, ScrollEventType.BEGIN_DRAG, null, true);
    }

    public static void emitScrollEndDragEvent(ViewGroup scrollView) {
        emitScrollEvent(scrollView, ScrollEventType.END_DRAG, null, true);
    }

    public static void emitScrollMomentumBeginEvent(ViewGroup scrollView) {
        emitScrollEvent(scrollView, ScrollEventType.MOMENTUM_BEGIN, null, true);
    }

    public static void emitScrollMomentumEndEvent(ViewGroup scrollView) {
        emitScrollEvent(scrollView, ScrollEventType.MOMENTUM_END, null, true);
    }

    private static void emitScrollEvent(ViewGroup scrollView, ScrollEventType scrollEventType,
                                        @Nullable ArrayList<String> visibleIds,
                                        @Nullable boolean humanInteraction) {
        View contentView = scrollView.getChildAt(0);

        if (contentView == null) {
            return;
        }

        // Zulip changes
        ReactContext reactContext = (ReactContext) scrollView.getContext();
        reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher().dispatchEvent(
                AnchorScrollEvent.obtain(
                        scrollView.getId(),
                        scrollEventType,
                        scrollView.getScrollX(),
                        scrollView.getScrollY(),
                        contentView.getWidth(),
                        contentView.getHeight(),
                        scrollView.getWidth(),
                        scrollView.getHeight(),
                        visibleIds,
                        humanInteraction)
        );
    }

    public static int parseOverScrollMode(String jsOverScrollMode) {
        if (jsOverScrollMode == null || jsOverScrollMode.equals(AUTO)) {
            return View.OVER_SCROLL_IF_CONTENT_SCROLLS;
        } else if (jsOverScrollMode.equals(OVER_SCROLL_ALWAYS)) {
            return View.OVER_SCROLL_ALWAYS;
        } else if (jsOverScrollMode.equals(OVER_SCROLL_NEVER)) {
            return View.OVER_SCROLL_NEVER;
        } else {
            throw new JSApplicationIllegalArgumentException("wrong overScrollMode: " + jsOverScrollMode);
        }
    }
}
