@objc(ZLPNotifications)
class ZLPNotifications: NSObject {
  // For why we include this, see
  //   https://reactnative.dev/docs/0.68/native-modules-ios#exporting-constants
  @objc
  static func requiresMainQueueSetup() -> Bool {
    // Initialization may be done on any thread; we don't need access to
    // UIKit.
    return false
  }

  /// Whether the app can receive remote notifications.
  // Ideally we could subscribe to changes in this value, but there
  // doesn't seem to be an API for that. The caller can poll, e.g., by
  // re-checking when the user has returned to the app, which they might
  // do after changing the notification settings.
  @objc
  func areNotificationsAuthorized(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) -> Void {
    UNUserNotificationCenter.current()
      .getNotificationSettings(completionHandler: { (settings) -> Void in
        resolve(settings.authorizationStatus == UNAuthorizationStatus.authorized)
      })
  }

  @objc
  func constantsToExport() -> [String: Any]! {
    return [:]
  }
}
