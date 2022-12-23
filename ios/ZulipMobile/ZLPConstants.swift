import Foundation

@objc(ZLPConstants)
class ZLPConstants: NSObject {


  // For why we include this, see
  //   https://reactnative.dev/docs/0.68/native-modules-ios#exporting-constants
  @objc
  static func requiresMainQueueSetup() -> Bool {
    // Initialization may be done on any thread; we don't need access to
    // UIKit.
    return false
  }

  @objc
  func constantsToExport() -> [String: Any]! {
    return ["resourceURL": Bundle.main.resourceURL!.absoluteString]
  }
}
