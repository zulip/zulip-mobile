#import "ZLPInfoProperties.h"

@implementation ZLPInfoProperties

RCT_EXPORT_MODULE()

// For why we include this, see
// https://reactnative.dev/docs/0.60/native-modules-ios#implementing--requiresmainqueuesetup.
+ (BOOL)requiresMainQueueSetup
{
  return NO; // Initialization may be done on any thread; we don't need access to UIKit.
}

- (NSDictionary *)constantsToExport
{
  // Items from the Info.plist.
  return @{
           // We've added a custom entry that gives us the App ID
           // Prefix (a.k.a. the Team ID plus a dot). Access it.
           @"appIdentifierPrefix": [[NSBundle mainBundle] objectForInfoDictionaryKey:@"AppIdentifierPrefix"] ?: [NSNull null],
           };
}

@end
