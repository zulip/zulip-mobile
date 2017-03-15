# Release guide

## For Android

* Uncomment Crashlytics refrences (The following are known references as at https://github.com/zulip/zulip-mobile/commit/a06862f86e752e106cde42229ea12842a3acba21). 

- In `/android/app/build.gradle`  [apply plugin: 'io.fabric'](https://github.com/zulip/zulip-mobile/blob/master/android/app/build.gradle#L138)

- In `/android/app/src/main/java/com/zulipmobile/MainApplication.java` [Fabric.with(this, new Crashlytics());](https://github.com/zulip/zulip-mobile/blob/master/android/app/src/main/java/com/zulipmobile/MainApplication.java#L26)

* Add API key in `/android/app/src/main/AndroidManifest.xml` [android:value="[YOUR API KEY]"](https://github.com/zulip/zulip-mobile/blob/master/android/app/src/main/AndroidManifest.xml#L32)

* Generate Signed APK.
