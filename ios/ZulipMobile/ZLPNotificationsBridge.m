#import "React/RCTBridgeModule.h"

// Register the ZLPNotificationsStatus implementation with React Native
// needed because ZLPNotificationsStatus is in Swift:
//   https://reactnative.dev/docs/0.68/native-modules-ios#exporting-swift
@interface RCT_EXTERN_MODULE(ZLPNotificationsStatus, NSObject)

    RCT_EXTERN_METHOD(areNotificationsAuthorized:
        (RCTPromiseResolveBlock) resolve
        rejecter: (RCTPromiseRejectBlock) reject
    )

@end
