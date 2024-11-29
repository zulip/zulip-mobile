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
  // For why we include this, see
  //   https://reactnative.dev/docs/0.68/native-modules-ios#exporting-constants
  @objc
  static func requiresMainQueueSetup() -> Bool {
    // From the RN doc linked above:
    // > If your module does not require access to UIKit, then you should
    // > respond to `+ requiresMainQueueSetup` with NO.
    //
    // The launchOptions dictionary (used in `constantsToExport`) is
    // accessed via the UIApplicationDelegate protocol, which is part of
    // UIKit:
    //   https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622921-application?language=objc
    //
    // So I think to follow RN's advice about accessing UIKit, it's probably
    // right to return `true`.
    return true
  }

  // The bridge object, provided by RN's RCTBridgeModule (via
  // RCT_EXTERN_MODULE in ZLPNotificationsBridge.m):
  //   https://github.com/facebook/react-native/blob/v0.68.7/React/Base/RCTBridgeModule.h#L152-L159
  @objc
  var bridge: RCTBridge!

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
    var result: [String: Any] = [:]

    // `launchOptions` comes via our AppDelegate's
    // `application:didFinishLaunchingWithOptions:` method override. From
    // the doc for that method (on UIApplicationDelegate):
    //   https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622921-application?language=objc
    // > A dictionary indicating the reason the app was launched (if any).
    // > The contents of this dictionary may be empty in situations where
    // > the user launched the app directly. […]
    //
    // In particular, for our purpose here: if the app was launched from a
    // notification, then it wasn't "launched […] directly".
    //
    // Empirically, launchOptions *itself* may be missing, which is
    // different from being empty; the distinction matters in Swift-land
    // where it's an error to access properties of nil. This doesn't seem
    // quite covered by "[t]he contents of this dictionary may be empty",
    // but anyway it explains our optional chaining on .launchOptions.
    result["initialNotification"] = bridge.launchOptions?[UIApplication.LaunchOptionsKey.remoteNotification] ?? kCFNull

    return result
  }
}
