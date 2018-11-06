import Foundation

@objc(UtilManager)
class UtilManager: NSObject {
  @objc func randomBase64(_ length: Int, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    var keyData = Data(count: length)
    let result = keyData.withUnsafeMutableBytes {
      SecRandomCopyBytes(kSecRandomDefault, length, $0)
    }

    if result == errSecSuccess {
      resolve(keyData.base64EncodedString())
    } else {
      let error: NSError = NSError(domain: "zulip", code: Int(result), userInfo: nil)
      reject("random_failed", "Could not generate random data", error)
    }
  }
}
