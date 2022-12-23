#import "React/RCTBridgeModule.h"

// Register the ZLPConstants implementation with React Native, needed
// because ZLPConstants is in Swift:
//   https://reactnative.dev/docs/0.68/native-modules-ios#exporting-swift
@interface RCT_EXTERN_MODULE(ZLPConstants, NSObject)
@end
