#ifndef RNGoogleSignIn_Bridging_Header_h
#define RNGoogleSignIn_Bridging_Header_h

#if __has_include(<React/RCTBridgeModule.h>)
  #import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
  #import "RCTBridgeModule.h"
#else
  #import "React/RCTBridgeModule.h"
#endif

#if __has_include(<React/RCTViewManager.h>)
  #import <React/RCTViewManager.h>
#elif __has_include("RCTViewManager.h")
  #import "RCTViewManager.h"
#else
  #import "React/RCTViewManager.h"
#endif

#if __has_include(<React/RCTEventEmitter.h>)
  #import <React/RCTEventEmitter.h>
#elif __has_include("RCTEventEmitter.h")
  #import "RCTEventEmitter.h"
#else
  #import "React/RCTEventEmitter.h"
#endif

#import <Google/SignIn.h>

#endif /* RNGoogleSignIn_Bridging_Header_h */
