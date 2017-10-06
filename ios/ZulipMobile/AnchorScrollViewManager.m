/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/*
 * Modified for ZulipMobile
 */

#import "AnchorScrollViewManager.h"

#import "AnchorScrollView.h"

#import <objc/runtime.h>

@implementation AnchorScrollViewManager

RCT_EXTERN void RCTRegisterModule(Class);

+ (NSString *) moduleName {
  return @"AnchorScrollView";
}

+ (void)load {
  // This is pure voodoo
  // It copies over all of the RCTScrollViewManager properties onto this class
  unsigned int count = 0;
  Method *methods = class_copyMethodList(object_getClass([self superclass]), &count);
  for (unsigned int i = 0; i < count; i++) {
    SEL selector = method_getName(methods[i]);
    const char *selectorName = sel_getName(selector);
    if (strncmp(selectorName, "propConfig", strlen("propConfig")) != 0) {
      continue;
    }
    class_addMethod(
                    object_getClass([self class]),
                    method_getName(methods[i]),
                    method_getImplementation(methods[i]),
                    method_getTypeEncoding(methods[i])
                    );
  }

  RCTRegisterModule(self);
}

- (UIView *)view
{
  return [[AnchorScrollView alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}

RCT_EXPORT_VIEW_PROPERTY(autoScrollToBottom, BOOL)

@end
