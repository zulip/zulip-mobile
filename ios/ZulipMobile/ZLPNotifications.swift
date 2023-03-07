import Foundation
import UIKit
import React.RCTBridgeModule
import React.RCTConvert
import React.RCTEventEmitter

@objc(ZLPNotificationsEvents)
class ZLPNotificationsEvents: RCTEventEmitter {
  static var currentInstance: ZLPNotificationsEvents? = nil

  override func startObserving() -> Void {
    super.startObserving()
    ZLPNotificationsEvents.currentInstance = self
  }

  override func stopObserving() -> Void {
    ZLPNotificationsEvents.currentInstance = nil
    super.stopObserving()
  }

  @objc
  override func supportedEvents() -> [String] {
    return ["response"]
  }

  @objc
  class func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: () -> Void
  ) {
    currentInstance?.sendEvent(
      withName: "response",

      // The RCTJSONClean was copied over from
      // @react-native-community/push-notification-ios; possibly we don't
      // need it.
      body: RCTJSONClean(
        response.notification.request.content.userInfo
      )
    )
    completionHandler()
  }
}

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
