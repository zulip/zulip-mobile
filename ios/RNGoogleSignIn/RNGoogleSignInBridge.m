//
//  RNGoogleSignInBridge.m
//
//  Created by Joon Ho Cho on 1/16/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

#if __has_include(<React/RCTBridgeModule.h>)
  #import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
  #import "RCTBridgeModule.h"
#else
  #import "React/RCTBridgeModule.h"
#endif

@interface RCT_EXTERN_MODULE(RNGoogleSignIn, NSObject)

// RCT_EXTERN_METHOD(addEvent:(NSString *)name location:(NSString *)location date:(nonnull NSNumber *)date callback: (RCTResponseSenderBlock)callback);
RCT_EXTERN_METHOD(configure:(NSDictionary *)config);
RCT_EXTERN_METHOD(signIn);
RCT_EXTERN_METHOD(signOut);
RCT_EXTERN_METHOD(signInSilently);
RCT_EXTERN_METHOD(disconnect);
RCT_EXTERN_METHOD(currentUser:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(hasAuthInKeychain:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

@end
