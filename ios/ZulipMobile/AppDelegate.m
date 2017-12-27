/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#if __has_include(<React/RNSentry.h>)
#import <React/RNSentry.h> // This is used for versions of react >= 0.40
#else
#import "RNSentry.h" // This is used for versions of react < 0.40
#endif
#import <React/RNSentry.h> // This is used for versions of react >= 0.40
#import <React/RCTLinkingManager.h>
#import <asl.h>
#import "RCTLog.h"
#import "RNNotifications.h"
#import <React/RCTPushNotificationManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

  [[RCTBundleURLProvider sharedSettings] setDefaults];
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];

  RCTSetLogThreshold(RCTLogLevelError);

  // Set up React Native root view
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"ZulipMobile"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  [RNSentry installWithRootView:rootView];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

RCTLogFunction CrashlyticsReactLogFunction = ^(
                                         RCTLogLevel level,
                                         __unused RCTLogSource source,
                                         NSString *fileName,
                                         NSNumber *lineNumber,
                                         NSString *message
                                         )
{
    NSString *log = RCTFormatLog([NSDate date], level, fileName, lineNumber, message);

    #ifdef DEBUG
        fprintf(stderr, "%s\n", log.UTF8String);
        fflush(stderr);
    #else
        NSLog(@"REACT LOG: %s", log.UTF8String);
    #endif

    int aslLevel;
    switch(level) {
        case RCTLogLevelTrace:
            aslLevel = ASL_LEVEL_DEBUG;
            break;
        case RCTLogLevelInfo:
            aslLevel = ASL_LEVEL_NOTICE;
            break;
        case RCTLogLevelWarning:
            aslLevel = ASL_LEVEL_WARNING;
            break;
        case RCTLogLevelError:
            aslLevel = ASL_LEVEL_ERR;
            break;
        case RCTLogLevelFatal:
            aslLevel = ASL_LEVEL_CRIT;
            break;
    }
    asl_log(NULL, NULL, aslLevel, "%s", message.UTF8String);
};

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}
// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RNNotifications didRegisterUserNotificationSettings:notificationSettings];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNNotifications didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [RNNotifications didFailToRegisterForRemoteNotificationsWithError:error];
}

// Required for the notification event.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
                                                       fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNNotifications didReceiveRemoteNotification:userInfo];
  [RCTPushNotificationManager didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RNNotifications didReceiveLocalNotification:notification];
  [RCTPushNotificationManager didReceiveLocalNotification:notification];
}
@end
