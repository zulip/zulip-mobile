//
//  UtilManager.m
//  ZulipMobile
//

#import "UtilManager.h"

@implementation UtilManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(randomBase64:(NSUInteger)length
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSMutableData *data = [NSMutableData dataWithLength:length];
  int ret = SecRandomCopyBytes(kSecRandomDefault, length, [data mutableBytes]);
  
  if (ret != 0) {
    NSError *error = [NSError errorWithDomain:@"zulip" code:ret userInfo:nil];
    reject(@"random_failed", @"Could not generate random data", error);
  } else {
    resolve([data base64EncodedStringWithOptions:0]);
  }
}

@end
