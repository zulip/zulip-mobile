import Foundation
import UIKit
import React.RCTBridgeModule

@objc(ZLPNotificationsStatus)
class ZLPNotificationsStatus: NSObject {
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
}
