import Foundation

@objc(UtilManager)
class UtilManager: NSObject {

  @objc func randomBase64(length: Int, _ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    var data = Data(count: length);

    var ret = SecRandomCopyBytes(kSecRandomDefault, length, data);

    if (ret != 0) {
      // NSError *error = [NSError errorWithDomain:@"zulip" code:ret userInfo:nil];
      reject("random_failed", "Could not generate random data", error);
    } else {
      resolve(data);
    }
  }
}
