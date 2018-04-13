//
//  ConnectIgnoringSSLIOS
//  ZulipMobile
//
//  Created by Ebou Jobe on 13/04/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
import SwiftSocket

@objc(ConnectIgnoringSSLIOS)
class ConnectIgnoringSSLIOS : NSObject {
  // Export constants to use in your native module

  @objc func connect(_ url: String,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
    let client = TCPClient(address: url, port: 443)
    switch client.connect(timeout: 10) {
    case .success:
      resolve("successful")
      break
    case .failure(let error):
      let errorMsg = "Unable to connect to the url"
      let err: NSError = NSError(domain: errorMsg, code: 0, userInfo: nil)
      reject("Unsuccessful", errorMsg, err)
      break
    }
  }
}
