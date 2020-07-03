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
           // In the Info.plist, our custom entry for the App ID
           // Prefix (a.k.a. the Team ID plus a dot).
           @"appIdentifierPrefix": [[NSBundle mainBundle] objectForInfoDictionaryKey:@"AppIdentifierPrefix"] ?: [NSNull null],
           };
}

@end
