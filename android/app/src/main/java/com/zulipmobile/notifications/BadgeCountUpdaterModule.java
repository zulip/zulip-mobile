package com.zulipmobile.notifications;


import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import me.leolin.shortcutbadger.ShortcutBadgeException;
import me.leolin.shortcutbadger.ShortcutBadger;

public class BadgeCountUpdaterModule extends ReactContextBaseJavaModule {

    public BadgeCountUpdaterModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BadgeCountUpdaterModule";
    }


    @ReactMethod
    public void setBadgeCount(int number) {
        if (number == 0) {
            removeCount();
        } else {
            ShortcutBadger.applyCount(this.getReactApplicationContext(), number);
        }
    }

    @ReactMethod
    public void removeCount() {
        try {
            ShortcutBadger.removeCountOrThrow(this.getReactApplicationContext());
        } catch (ShortcutBadgeException e) {
            e.printStackTrace();
        }
    }

}