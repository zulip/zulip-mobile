package com.zulipmobile;

import android.app.Application;
import android.content.Context;
import android.util.Log;

import com.facebook.react.PackageList;
import com.facebook.hermes.reactexecutor.HermesExecutorFactory;
import com.facebook.react.bridge.JavaScriptExecutorFactory;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;
import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.SingletonModule;

import com.zulipmobile.generated.BasePackageList;
import com.zulipmobile.notifications.ConversationMap;
import com.zulipmobile.notifications.FCMPushNotifications;
import com.zulipmobile.notifications.NotificationsPackage;
import com.zulipmobile.sharing.SharingPackage;

public class MainApplication extends Application implements ReactApplication {
    private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(new BasePackageList().getPackageList(), null);

    private ConversationMap conversations;

    public ConversationMap getConversations() {
        return conversations;
    }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            // Autolinked packages.
            //
            // To check what's included, see the
            // `getPackages` implementation, which is auto-generated
            // (android/app/build/generated/rncli/src/main/java/com/facebook/react/PackageList.java):
            @SuppressWarnings("UnnecessaryLocalVariable")
            List<ReactPackage> packages = new PackageList(this).getPackages();

            // Packages that should be linked, but can't be with
            // autolinking:
            packages.add(new ZulipNativePackage());
            packages.add(new NotificationsPackage());
            packages.add(new SharingPackage());

            // Unimodules:
            packages.add(new ModuleRegistryAdapter(mModuleRegistryProvider));

            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        FCMPushNotifications.createNotificationChannel(this);
        SoLoader.init(this, /* native exopackage */ false);
        conversations = new ConversationMap();
    }

    /**
     * Loads Flipper in React Native templates.
     *
     * @param context
     */
    private static void initializeFlipper(Context context) {
        if (BuildConfig.DEBUG) {
            try {
                /*
                We use reflection here to pick up the class that initializes Flipper,
                since Flipper library is not available in release mode
                */
                Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
                aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
        }
    }
}
