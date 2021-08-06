#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <UMReactNativeAdapter/UMModuleRegistryAdapter.h>
#import <UserNotifications/UNUserNotificationCenter.h>
#import <UMCore/UMAppDelegateWrapper.h>

@interface AppDelegate : UMAppDelegateWrapper <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate>
@property (nonatomic, strong) UIWindow *window;

@end
