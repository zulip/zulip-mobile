#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(UtilManager, NSObject)
  RCT_EXTERN_METHOD(randomBase64:(NSUInteger) length
                  resolver:(RCTPromiseResolveBlock *)resolve
                  rejecter:(RCTPromiseRejectBlock *)reject
                  )
@end
