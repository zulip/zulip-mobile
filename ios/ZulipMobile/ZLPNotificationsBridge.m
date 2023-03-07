#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

// Register our Swift modules with React Native:
//   https://reactnative.dev/docs/0.68/native-modules-ios#exporting-swift

@interface RCT_EXTERN_MODULE(ZLPNotificationsEvents, RCTEventEmitter)
@end

@interface RCT_EXTERN_MODULE(ZLPNotificationsStatus, NSObject)

    RCT_EXTERN_METHOD(areNotificationsAuthorized:
        (RCTPromiseResolveBlock) resolve
        rejecter: (RCTPromiseRejectBlock) reject
    )

@end
