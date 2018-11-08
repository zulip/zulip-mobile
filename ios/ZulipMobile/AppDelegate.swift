import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?
  var bridge: RCTBridge!

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index.ios", fallbackResource: nil)
    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "ZulipMobile", initialProperties: nil, launchOptions: launchOptions)
    rootView!.backgroundColor = .white
    let rootViewController = UIViewController()
    rootViewController.view = rootView
    self.window = UIWindow(frame: UIScreen.main.bounds)
    self.window!.rootViewController = rootViewController
    self.window!.makeKeyAndVisible()

    return true
  }

  // Required to register for notifications
  func application(_ application: UIApplication, didRegister notificationSettings: UIUserNotificationSettings) {
    RNNotifications.didRegister(notificationSettings);
  }

  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: UIUserNotificationSettings?) {
    RNNotifications.didRegister(deviceToken);
  }

  func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    RNNotifications.didFailToRegisterForRemoteNotificationsWithError(error);
  }

  // Required for the notification event.
  func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    RNNotifications.didReceiveRemoteNotification(userInfo);
    RCTPushNotificationManager.didReceiveRemoteNotification(userInfo, fetchCompletionHandler: completionHandler);
  }

  // Required for the localNotification event.
  func application(_ application: UIApplication, didReceive notification: UILocalNotification) {
    RNNotifications.didReceive(notification);
    RCTPushNotificationManager.didReceive(notification);
  }
}
