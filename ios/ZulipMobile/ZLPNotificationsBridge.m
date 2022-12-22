#import "React/RCTBridgeModule.h"

// Register the ZLPNotifications implementation with React Native, needed
// because ZLPNotifications is in Swift:
//   https://reactnative.dev/docs/0.68/native-modules-ios#exporting-swift
@interface RCT_EXTERN_MODULE(ZLPNotifications, NSObject)

    RCT_EXTERN_METHOD(areNotificationsAuthorized:
        (RCTPromiseResolveBlock) resolve
        rejecter: (RCTPromiseRejectBlock) reject
    )

@end
