package com.zulipmobile;

import android.support.annotation.Nullable;

import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.view.ReactViewGroup;
import com.facebook.react.views.view.ReactViewManager;

public class TaggedViewManager extends ReactViewManager {
    public static final String REACT_CLASS = "TaggedView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactProp(name = "tagID")
    public void setTagID(ReactViewGroup view, @Nullable String tag) {
        view.setTag(tag);
    }
}
