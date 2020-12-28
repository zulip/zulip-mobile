#import "ZLPConstants.h"

@implementation ZLPConstants

RCT_EXPORT_MODULE()

// For why we include this, see
// https://reactnative.dev/docs/0.60/native-modules-ios#implementing--requiresmainqueuesetup.
+ (BOOL)requiresMainQueueSetup
{
  return NO; // Initialization may be done on any thread; we don't need access to UIKit.
}

- (NSDictionary *)constantsToExport
{
  return @{
           @"resourceURL": [[[NSBundle mainBundle] resourceURL] absoluteString]
           };
}

@end
