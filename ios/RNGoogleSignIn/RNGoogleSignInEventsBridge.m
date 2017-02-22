//
//  RNGoogleSignInEventsBridge.m
//
//  Created by Joon Ho Cho on 1/17/17.
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

@interface RCT_EXTERN_MODULE(RNGoogleSignInEvents, NSObject)

@end
